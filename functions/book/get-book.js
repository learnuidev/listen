const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getBookById } = require("./get-book.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { bookId } = JSON.parse(event.body);

    const book = await getBookById(bookId);

    if (book.userId !== userId) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Book not found" }),
      };

      return response;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(book),
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
