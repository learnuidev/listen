const { addContentAnalyticsApi } = require("./add-content-analytics.api");
const { getContentAnalyticsApi } = require("./get-content-analytics.api");
const { updateContentAnalyticsApi } = require("./update-content-analytics.api");

const upsertContentAnalyticsApi = async ({ userId, contentId, ...rest }) => {
  const contentAnalytics = await getContentAnalyticsApi({ userId, contentId });

  if (contentAnalytics) {
    return updateContentAnalyticsApi({ userId, contentId, ...rest });
  }

  return addContentAnalyticsApi({ userId, contentId, ...rest });
};

module.exports = {
  upsertContentAnalyticsApi,
};
