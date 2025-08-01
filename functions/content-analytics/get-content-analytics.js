const middy = require("@middy/core");
const cors = require("@middy/http-cors");

// const { getContentAnalytics } = require("./get-content-analytics.api");
const { getContentApi } = require("./get-content.api");
const { getContentAnalyticsApi } = require("./get-content-analytics.api");

const getContentAnalyticsHandler = async (event) => {
  const userId = event.requestContext.authorizer.claims.email;
  const { contentId } = JSON.parse(event.body);

  try {
    const content = await getContentApi({ contentId });

    if (!content) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Content not found" }),
      };

      return response;
    }

    let contentAnalytics = await getContentAnalyticsApi({ contentId, userId });

    if (!contentAnalytics) {
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          totalRepeats: 0,
          totalPlays: 0,
          totalTimePlayed: 0,
          repeatsPerTranscription: [],
        }),
      };

      return response;
    }

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
module.exports.handler = middy(getContentAnalyticsHandler).use(cors());
