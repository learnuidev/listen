// An endpoints that checks if the character exisits or not
// if it does - then adds pinyin and english, pinyin level, initial and final to the component and saves it
// if it does not then creates a new component and adds pinyin, english, initial, final and group

const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
const { tableNames } = require("../../constants/table-names");
const { bucketNames } = require("../../constants/bucket-names");
const { getUserAsset } = require("../book/get-user-asset.api");
const s3 = new S3({ useAccelerateEndpoint: true });

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const _getUserAsset = async ({ userId, id }) => {
  const character = await getUserAsset(id);

  if (character?.userId === userId) {
    return character;
  }

  return null;
};

const deleteUserAssetApi = async ({ userId, id }) => {
  try {
    const userAsset = await _getUserAsset({ id, userId });

    if (!userAsset) {
      return `User asset for ${id} not found`;
    }

    // 1. Delete user asset
    await dynamodb
      .delete({
        Key: {
          id: userAsset.id,
        },
        TableName: tableNames.userAssetsTable,
      })
      .promise();

    // 2. delete

    await s3
      .deleteObject({
        Bucket: bucketNames.mediaAssetsBucket,
        Key: userAsset?.uploadBucketKey,
      })
      .promise();
    console.log(
      `Successfully deleted key: ${userAsset?.uploadBucketKey} from the bucket`
    );

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  deleteUserAssetApi,
};
