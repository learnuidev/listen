const { tableNames } = require("../../constants/table-names");

/* eslint-disable no-undef */
const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listBooksByUserId = async ({ userId, lastEvaulatedKey }) => {
  const params = {
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    KeyConditionExpression: "userId = :userId",
    IndexName: "byUserId",
    TableName: tableNames.booksTable,
    Limit: 100,
    ExclusiveStartKey: lastEvaulatedKey,
  };

  const resp = await dynamodb.query(params).promise();

  return {
    items: resp?.Items,
    lastEvaulatedKey: resp?.LastEvaluatedKey,
  };
};

// listBooksByUserId({
//   userId: "learnuidev@gmail.com",
// }).then((books) => {
//   console.log("books", books);
// });

module.exports = {
  listBooksByUserId,
};
