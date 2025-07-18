// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getMediaFile } = require("./get-media-file.api");
const { getMediaById } = require("./get-media.api");

const _getMediaById = async (contentId, userId) => {
  const media = getMediaById(contentId);

  if (media.userId === userId) {
    return media;
  }

  return null;
};

const getContentByIdHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.claims.email;
    const { mediaId } = JSON.parse(event.body);

    const media = await _getMediaById(mediaId, userId);

    if (!media) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Not found" }),
      };

      return response;
    }

    if (media?.mediaFileId) {
      const mediaFile = await getMediaFile(media.mediaFileId);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          ...media,
          mediaFile,
        }),
      };

      return response;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(media),
    };

    return response;
  } catch (err) {
    console.log("ERR", err);
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Error! Something went wrong" }),
    };

    return response;
  }
};

module.exports.handler = middy(getContentByIdHandler).use(cors());
