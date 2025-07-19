const AWS = require("aws-sdk");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const getBookById = async (bookId) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: bookId,
      },
      TableName: tableNames.booksTable,
    })
    .promise();

  const media = resp.Item;

  return media;
};

// getBookById("01K0JCW67AX9JRY2ZSD00075TW").then((book) => {
//   console.log("book", book);
// });

module.exports = {
  getBookById,
};
