// An endpoints that checks if the character exisits or not
// if it does - then adds pinyin and english, pinyin level, initial and final to the component and saves it
// if it does not then creates a new component and adds pinyin, english, initial, final and group

const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
const { tableNames } = require("../../constants/table-names");
const { bucketNames } = require("../../constants/bucket-names");
const { getMediaFile } = require("./get-media-file.api");
const s3 = new S3({ useAccelerateEndpoint: true });

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteMediaFileApi = async ({ userId, id }) => {
  try {
    let mediaFile = await getMediaFile(id);

    mediaFile = mediaFile?.userId === userId ? mediaFile : null;

    if (!mediaFile) {
      return `User asset for ${id} not found`;
    }

    // 1. Delete user asset
    await dynamodb
      .delete({
        Key: {
          id: id,
        },
        TableName: tableNames.mediaFilesTable,
      })
      .promise();

    // 2. delete

    if (mediaFile.s3Key) {
      await s3
        .deleteObject({
          Bucket: bucketNames.mediaAssetsBucket,
          Key: mediaFile.s3Key,
        })
        .promise();
      console.log(
        `Successfully deleted key: ${mediaFile.s3Key} from the bucket`
      );
    }

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  deleteMediaFileApi,
};
