const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addMediaApi } = require("./add-media.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { text, type } = JSON.parse(event.body);

    const params = await addMediaApi({ userId, text, type });

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
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
