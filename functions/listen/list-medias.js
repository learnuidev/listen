// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listMediaByUserId } = require("./list-medias.api");

module.exports.handler = middy(async (event) => {
  try {
    const { lastEvaulatedKey } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.email;

    const medias = await listMediaByUserId({ userId, lastEvaulatedKey });
    const response = {
      statusCode: 200,
      body: JSON.stringify(medias),
    };

    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Something went wrong" }),
    };

    return response;
  }
}).use(cors());
