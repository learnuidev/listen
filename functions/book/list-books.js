// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listBooksByUserId } = require("./list-books.api");
const { addCoverPhotoUrl } = require("./add-cover-photo-url");

module.exports.handler = middy(async (event) => {
  try {
    const { lastEvaulatedKey } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.email;

    const books = await listBooksByUserId({ userId, lastEvaulatedKey });

    const booksWithMedia = {
      ...books,
      items: await Promise.all(
        books?.items?.map(async (book) => {
          const bookWithMedia = await addCoverPhotoUrl(book);

          return bookWithMedia;
        })
      ),
    };
    const response = {
      statusCode: 200,
      body: JSON.stringify(booksWithMedia),
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
