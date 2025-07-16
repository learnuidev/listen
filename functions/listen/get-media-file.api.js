const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");
const { bucketNames } = require("../../constants/bucket-names");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

async function getMediaFile({ id }) {
  const jettoFile = (
    await dynamodb
      .get({
        TableName: tableNames.mediaFilesTable,
        Key: {
          id,
        },
      })
      .promise()
  ).Item;

  const presignedUrl = await getPresignedUrl({
    bucketName: bucketNames.mediaAssetsBucket,
    bucketKey: jettoFile.s3Key,
  });

  return { ...jettoFile, audioUrl: presignedUrl.preSignedUrl };
}

module.exports = {
  getMediaFile,
};
