// 1. update media status: to "generating-transcript"
// 2. send text to speewchify api
// 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

// 4. once s3 is saved, save the s3 key and save it in media-files table
// 5. also store transcript in media-files table as well
// 6. take the id and store it in media table as well as update the status

// 7. once the transcript has been generated, start the translation pipeline
// 8. set the status to translating-transcript
// 9. once the trascript has been translated, set the status to 'transcript-translated'
// Done

const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");
const { textToAudio } = require("../../lib/speechify/text-to-audio");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

async function createMediaFile(input) {
  const { userId, s3Key, id, ...rest } = input;
  const params = removeNull(input);

  const inputParams = {
    Item: { s3Key, id, userId, ...rest, lastUpdated: Date.now() },
    TableName: tableNames.mediaFilesTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
}

const addTranslationsApi = async (newMedia) => {
  let statusHistory = newMedia.statusHistory || [];

  statusHistory = statusHistory.concat({
    type: "generating-transcript",
    createdAt: Date.now(),
  });

  // 1. update media status: to "generating-transcript"
  const updatedContent = constructParams({
    tableName: tableNames.mediaTable,
    attributes: removeNull({
      id: newMedia.id,
      status: "generating-transcript",
      statusHistory,
      lastUpdated: Date.now(),
    }),
    // attributes: params,
  });

  await dynamodb.update(updatedContent).promise();

  // 2. send text to speewchify api
  const speechifyResponse = await textToAudio(newMedia.text);

  const { audioData, ...rest } = speechifyResponse;

  console.log("SPEECHIFY RESP", speechifyResponse);

  const audioBuffer = Buffer.from(audioData, "base64");

  // 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

  const resp = await getUploadUrl({
    userId: newMedia.userId,
    contentType: "audio/mpeg",
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  const { s3Key } = resp;

  console.log("Resp", resp);

  // 4. once s3 is saved, save the s3 key and save it in media-files table
  const fetchResponse = await fetch(resp.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "audio/mpeg",
      // Content-Length is auto handled by fetch if needed
    },
    body: audioBuffer,
  });

  console.log("FETCH RESPONSE", fetchResponse);

  if (!fetchResponse.ok) {
    throw new Error(`Upload failed: ${fetchResponse.statusText}`);
  }

  // 5. also store transcript in media-files table as well
  const mediaFile = await createMediaFile({ ...resp, ...rest });

  // 6. take the id and store it in media table as well as update the status
  statusHistory = statusHistory.concat({
    type: "transcript-generated",
    createdAt: Date.now(),
  });
  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          s3Key,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "transcript-generated",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  // 7. once the transcript has been generated, start the translation pipeline (future work)
  // 8. set the status to translating-transcript
  statusHistory = statusHistory.concat({
    type: "translating-transcript",
    createdAt: Date.now(),
  });
  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          s3Key,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "translating-transcript",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  // 9. once the trascript has been translated, set the status to 'transcript-translated'
  statusHistory = statusHistory.concat({
    type: "transcript-translated",
    createdAt: Date.now(),
  });

  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "transcript-translated",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  return true;
};

addTranslationsApi({
  lastUpdated: 1752642624642,
  userId: "learnuidev@gmail.com",
  mediaFileId: "01K08T86NJN3STVMR7D5RVN24N",
  status: "file-added",
  createdAt: 1752642620805,
  text: "马克思以前的唯物论，离开人的社会性，离开人的历史发展，去观察认识问题，因此不能了解认识对社会实践的依赖关系，即认识对生产和阶级斗争的依赖关系。",
  id: "01K08T83C5G6T2QW0TJZHQ3YKE",
  statusHistory: [
    {
      type: "file-added",
      createdAt: 1752642620805,
    },
  ],
  type: "text",
  s3Key: "01K08T86NJN3STVMR7D5RVN24N.mp3",
}).then((resp) => {
  console.log("DONE", resp);
});

module.exports = {
  addTranslationsApi,
};
