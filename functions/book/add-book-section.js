// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addBookSectionApi } = require("./add-book-section.api");
const { getBookById } = require("./get-book.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;
  try {
    const { sectionId, bookId, ...rest } = JSON.parse(event.body);

    const book = await getBookById(bookId);

    if (!book) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({
          message: "Book not found",
        }),
      };

      return response;
    }

    if (book.userId !== userId) {
      const response = {
        statusCode: 403,
        body: JSON.stringify({
          message: "You dont have the permission to make this action",
        }),
      };

      return response;
    }

    const newBookSection = await addBookSectionApi({
      bookId,
      sectionId,
      ...rest,
    });
    const response = {
      statusCode: 200,
      body: JSON.stringify(newBookSection),
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
