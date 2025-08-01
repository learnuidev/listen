const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const { removeNull } = require("../../utils/remove-null");

const addContentAnalyticsApi = async ({ userId, contentId, ...rest }) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: "us-east-1",
  });

  const id = `${contentId}#${userId}`;

  const params = removeNull({
    id,
    userId,
    contentId,
    ...rest,
    createdAt: Date.now(),
  });

  const inputParams = {
    Item: params,
    TableName: tableNames.contentAnalyticsTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addContentAnalyticsApi,
};
