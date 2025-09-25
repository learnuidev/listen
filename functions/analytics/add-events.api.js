const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const ulid = require("ulid");
const { removeNull } = require("../../utils/remove-null");

const addEventsApi = async (props) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: "us-east-1",
  });

  const id = ulid.ulid();

  const params = removeNull({ id, ...props, createdAt: Date.now() });

  const inputParams = {
    Item: params,
    TableName: tableNames.analyticsTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addEventsApi,
};
