const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getAudioApi } = require("./get-audio.api");

module.exports.handler = middy(async (event) => {
  try {
    const { text, lang, provider = "narakeet" } = JSON.parse(event.body);

    let audio = await getAudioApi({ text, lang, provider });

    const response = {
      statusCode: 200,
      body: JSON.stringify(audio),
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
