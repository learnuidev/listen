const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getUserAsset = async (id) => {
  const userAsset = (
    await dynamodb
      .get({
        TableName: tableNames.userAssetsTable,
        Key: {
          id,
        },
      })
      .promise()
  )?.Item;

  return userAsset;
};

module.exports = {
  getUserAsset,
};
