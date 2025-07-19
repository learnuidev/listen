const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { updateMediaApi } = require("./update-media.api");
const { getMediaById } = require("./get-media.api");

const _getMediaById = async (contentId, userId) => {
  const media = await getMediaById(contentId);

  if (media.userId === userId) {
    return media;
  }

  return null;
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { mediaId, ...rest } = JSON.parse(event.body);

    const media = await _getMediaById(mediaId, userId);

    if (!media) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Media not found" }),
      };

      return response;
    }

    await updateMediaApi({ id: mediaId, ...rest });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ ...media, ...rest }),
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
}).use(cors());
