const AWS = require("aws-sdk");
const mime = require("mime-types");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");
const {
  textToAudio,
  defaultVoiceId,
} = require("../../lib/speechify/text-to-audio");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");
const { removeNull } = require("../../utils/remove-null");

async function createAudio(input) {
  const { s3Key, id, ...rest } = input;
  const params = removeNull(input);

  const inputParams = {
    Item: { s3Key, id, ...rest, lastUpdated: Date.now() },
    TableName: tableNames.booksTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
}

const createAudioApi = async ({ text, lang }) => {
  const id = `${text}_${lang}`;

  // 2. send text to speewchify api
  const speechifyResponse = await textToAudio(text, {
    voiceId: defaultVoiceId,
    lang,
  });

  const { audioData, ...rest } = speechifyResponse;

  const base64Data = audioData;

  const contentType = mime.lookup("result.mp3");

  // Convert Base64 to Buffer
  // eslint-disable-next-line no-undef
  const audioBuffer = Buffer.from(base64Data, "base64");

  // 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

  const resp = await getUploadUrl({
    contentType,
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  // 4. once s3 is saved, save the s3 key and save it in media-files table
  const fetchResponse = await fetch(resp.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: audioBuffer,
  });

  if (!fetchResponse.ok) {
    throw new Error(`Upload failed: ${fetchResponse.statusText}`);
  }

  const mediaFile = await createAudio({ ...resp, ...rest, id });

  return mediaFile;
};

module.exports = {
  createAudioApi,
};
