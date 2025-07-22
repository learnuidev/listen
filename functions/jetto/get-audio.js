const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getAudioByIdApi } = require("./get-audio-by-id.api");
const { createAudioApi } = require("./create-audio.api");

module.exports.handler = middy(async (event) => {
  try {
    const { text, lang } = JSON.parse(event.body);

    let audio = await getAudioByIdApi({ text, lang });

    if (audio) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(audio),
      };

      return response;
    } else {
      await createAudioApi({ text, lang });

      const audio = await getAudioByIdApi({ text, lang });

      const response = {
        statusCode: 200,
        body: JSON.stringify(audio),
      };

      return response;
    }
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
