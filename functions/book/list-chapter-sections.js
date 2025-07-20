// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listSectionsByChapterId } = require("./list-chapter-sections.api");

module.exports.handler = middy(async (event) => {
  try {
    const { lastEvaulatedKey, chapterId } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.email;

    const chapterSections = await listSectionsByChapterId({
      userId,
      chapterId,
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
