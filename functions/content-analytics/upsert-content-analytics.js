const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getContentApi } = require("./get-content.api");
const { upsertContentAnalyticsApi } = require("./upsert-content-analytics.api");

const upsertContentAnalyticsHandler = async (event) => {
  const userId = event.requestContext.authorizer.claims.email;
  const { contentId, ...rest } = JSON.parse(event.body);

  try {
    const content = await getContentApi({ contentId });

    if (!content) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Content not found" }),
      };

      return response;
    }

    let contentAnalytics = await upsertContentAnalyticsApi({
      userId,
      contentId,
      ...rest,
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify(contentAnalytics),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
};
module.exports.handler = middy(upsertContentAnalyticsHandler).use(cors());
