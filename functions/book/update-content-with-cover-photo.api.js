const AWS = require("aws-sdk");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { tableNames } = require("../../constants/table-names");

const updateContentWithConverPhotoApi = async ({ id, coverPhotoId }) => {
  const updatedContent = {
    id,
    coverPhotoId,
    lastUpdated: Date.now(),
  };

  const updatedContentWithCoverPhotoId = constructParams({
    tableName: tableNames.contentsTable,
    attributes: removeNull(updatedContent),
  });

  await dynamodb.update(updatedContentWithCoverPhotoId).promise();
};

module.exports = {
  updateContentWithConverPhotoApi,
};
