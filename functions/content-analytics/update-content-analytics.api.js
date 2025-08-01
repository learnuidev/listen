const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");
const { getContentAnalyticsApi } = require("./get-content-analytics.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const updateContentAnalyticsApi = async ({ userId, contentId, ...rest }) => {
  // 1. update media status: to "generating-transcript"
  const id = `${contentId}#${userId}`;

  const contentAnalytics = await getContentAnalyticsApi({ userId, contentId });

  const updatedAttributes = {
    id,
    ...rest,
    lastUpdated: Date.now(),
  };

  const updatedContentAnalytics = constructParams({
    tableName: tableNames.contentAnalyticsTable,
    attributes: removeNull(updatedAttributes),
    // attributes: params,
  });

  await dynamodb.update(updatedContentAnalytics).promise();

  return { ...contentAnalytics, ...updatedAttributes };
};

module.exports = {
  updateContentAnalyticsApi,
};
