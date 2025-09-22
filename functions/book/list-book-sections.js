// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listBookSectionsApi } = require("./list-book-sections.api");

module.exports.handler = middy(async (event) => {
  try {
    const { lastEvaulatedKey, bookId } = JSON.parse(event.body);

    const chapterSections = await listBookSectionsApi({
      bookId,
      lastEvaulatedKey,
    });
    const response = {
      statusCode: 200,
      body: JSON.stringify(chapterSections),
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
