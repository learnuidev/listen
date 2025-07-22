const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const { removeNull } = require("../../utils/remove-null");

async function createAudioDB(input) {
  const { s3Key, id, ...rest } = input;
  const params = removeNull(input);

  const inputParams = {
    Item: { s3Key, id, ...rest, lastUpdated: Date.now() },
    TableName: tableNames.textToSpeechTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
}

module.exports = {
  createAudioDB,
};
