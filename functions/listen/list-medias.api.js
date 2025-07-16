const { tableNames } = require("../../constants/table-names");

/* eslint-disable no-undef */
const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listMediaByUserId = async ({ userId, lastEvaulatedKey, tableName }) => {
  const params = {
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    KeyConditionExpression: "userId = :userId",
    IndexName: "byUserId",
    TableName: tableName || tableNames.mediaTable,
    Limit: 100,
    ExclusiveStartKey: lastEvaulatedKey,
  };

  const resp = await dynamodb.query(params).promise();

  return {
    items: resp?.Items,
    lastEvaulatedKey: resp?.LastEvaluatedKey,
  };
};

module.exports = {
  listMediaByUserId,
};
