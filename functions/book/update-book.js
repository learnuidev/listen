const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getBookById } = require("./get-book.api");
const { updateBookApi } = require("./update-book.api");

const _getBookById = async (contentId, userId) => {
  const media = await getBookById(contentId);

  if (media.userId === userId) {
    return media;
  }

  return null;
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { bookId, ...rest } = JSON.parse(event.body);

    const book = await _getBookById(bookId, userId);

    if (!book) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Book not found" }),
      };

      return response;
    }

    await updateBookApi({ id: bookId, ...rest });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ ...book, ...rest }),
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
