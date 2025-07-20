const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { deleteBookApi } = require("./delete-book.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { bookId } = JSON.parse(event.body);

    const params = await deleteBookApi({ bookId, userId });

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
