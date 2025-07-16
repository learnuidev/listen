const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const ulid = require("ulid");
const { removeNull } = require("../../utils/remove-null");

const addMediaApi = async ({ userId, text, type }) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: "us-east-1",
  });

  const id = ulid.ulid();

  const createdAt = Date.now();

  const params = removeNull({
    status: "file-added",
    id,
    userId,
    type,
    text,
    statusHistory: [{ type: "file-added", createdAt: Date.now() }],
    createdAt,
  });

  const inputParams = {
    Item: params,
    TableName: tableNames.mediaTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addMediaApi,
};
