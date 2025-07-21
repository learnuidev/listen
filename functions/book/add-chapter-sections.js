// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addChapterSectionsApi } = require("./add-chapter-sections.api");

module.exports.handler = middy(async (event) => {
  try {
    const { sections, chapterId } = JSON.parse(event.body);

    await addChapterSectionsApi({
      chapterId,
      sections,
    });
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        chapterId,
      }),
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
