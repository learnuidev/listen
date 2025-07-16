const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient();

// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { tableNames } = require("../../constants/table-names");
const { getMediaFile } = require("./get-media-file.api");

const getMediaById = async (contentId, userId) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: contentId,
      },
      TableName: tableNames.mediaTable,
    })
    .promise();

  const media = resp.Item;

  if (media.userId === userId) {
    return media;
  }

  return null;
};

const getContentByIdHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.claims.email;
    const { mediaId } = JSON.parse(event.body);

    const media = await getMediaById(mediaId, userId);

    if (!media) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Not found" }),
      };

      return response;
    }

    const mediaFile = await getMediaFile(media.mediaFileId);

    if (media?.sourceUrl) {
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
