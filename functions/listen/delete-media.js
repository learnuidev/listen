const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { deleteMediaApi } = require("./delete-media.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { mediaId } = JSON.parse(event.body);

    const deletedMedia = await deleteMediaApi({ userId, mediaId });

    const response = {
      statusCode: 200,
      body: JSON.stringify(deletedMedia),
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
