const AWS = require("aws-sdk");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const getContentApi = async ({ contentId }) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: contentId,
      },
      TableName: tableNames.contentsTable,
    })
    .promise();

  const content = resp.Item;

  return content;
};

// testing
// getContentApi({
//   contentId: "",
// }).then((resp) => {
//   console.log("content", resp);
// });

module.exports = {
  getContentApi,
};
