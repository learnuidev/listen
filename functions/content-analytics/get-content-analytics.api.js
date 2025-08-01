const AWS = require("aws-sdk");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const getContentAnalyticsApi = async ({ contentId, userId }) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: `${contentId}#${userId}`,
      },
      TableName: tableNames.contentAnalyticsTable,
    })
    .promise();

  const contentAnalytics = resp.Item;

  return contentAnalytics;
};

// getBookById("01K0JCW67AX9JRY2ZSD00075TW").then((book) => {
//   console.log("book", book);
// });

module.exports = {
  getContentAnalyticsApi,
};
