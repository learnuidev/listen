const AWS = require("aws-sdk");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { bucketNames } = require("../../constants/bucket-names");

const getAudioByIdApi = async ({ text, lang }) => {
  const audioId = `${text}#${lang}`;
  const resp = await dynamodb
    .get({
      Key: {
        id: audioId,
      },
      TableName: tableNames.textToSpeechTable,
    })
    .promise();

  const audio = resp.Item;

  if (audio) {
    const presignedUrl = await getPresignedUrl({
      bucketName: bucketNames.mediaAssetsBucket,
      bucketKey: audio.s3Key,
    });

    return { ...audio, audioUrl: presignedUrl.preSignedUrl };
  }

  return audio;
};

module.exports = {
  getAudioByIdApi,
};
