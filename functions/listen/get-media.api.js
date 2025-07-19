const AWS = require("aws-sdk");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const getMediaById = async (mediaId) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: mediaId,
      },
      TableName: tableNames.mediaTable,
    })
    .promise();

  const media = resp.Item;

  return media;
};

module.exports = {
  getMediaById,
};
