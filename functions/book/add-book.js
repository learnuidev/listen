const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addBookApi } = require("./add-book.api");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { title, author, chapters, tags, lang } = JSON.parse(event.body);

    const params = await addBookApi({
      title,
      author,
      chapters,
      tags,
      lang,
      userId,
    });

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
