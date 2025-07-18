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
const { getMediaById } = require("./get-media.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

// human media pipeline

// 1 user uploads audio
// 2 use elevenlabs to convert audio to text
// 3 save response in media Files under

const audioToTranscript = async ({ audioUrl }) => {
  return audioUrl;
};

const updateMediaStatus = async ({ mediaId }) => {
  const media = await getMediaById(mediaId);

  const updatedMedia = constructParams({
    tableName: tableNames.mediaTable,
    attributes: removeNull({
      id: mediaId,
      status: media.status.concat({
        type: "human-audio-timestamps-generated",
        createdAt: Date.now(),
      }),
      lastUpdated: Date.now(),
    }),
    // attributes: params,
  });

  await dynamodb.update(updatedMedia).promise();
};

const updateMediaFile = async ({ mediaFileId, humanAudioTimestamps }) => {
  const updatedMediaFile = constructParams({
    tableName: tableNames.mediaFilesTable,
    attributes: removeNull({
      id: mediaFileId,
      humanAudioTimestamps,

      lastUpdated: Date.now(),
    }),
    // attributes: params,
  });

  await dynamodb.update(updatedMediaFile).promise();
};

const pipeline = async ({ audioUrl, mediaId }) => {
  const humanAudioTimestamps = await audioToTranscript({ audioUrl });

  const media = await getMediaById(mediaId);

  await updateMediaStatus({ media });

  await updateMediaFile({
    mediaFileId: media.mediaFileId,
    humanAudioTimestamps,
  });
};

pipeline();
