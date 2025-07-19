const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteChapterSectionApi = async (sectionId) => {
  // Prepare the batch write parameters

  const val = await dynamodb
    .delete({
      Key: {
        id: sectionId,
      },
      TableName: tableNames.chapterSectionsTable,
    })
    .promise();

  return {
    ...val,
    id: sectionId,
    deletedAt: Date.now(),
  };
};

module.exports = {
  deleteChapterSectionApi,
};
