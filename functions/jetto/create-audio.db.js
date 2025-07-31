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

  await dynamodb
    .put({
      Item: { s3Key, id, ...rest, lastUpdated: Date.now() },
      TableName: tableNames.textToSpeechTable,
      // ConditionExpression: "attribute_not_exists(id)",
    })
    .promise();

  return params;
}

module.exports = {
  createAudioDB,
};
