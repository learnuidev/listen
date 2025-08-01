const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getAudioApi } = require("./get-audio.api");

const defaultAudioProvider = "speechify" || "minimax";

module.exports.handler = middy(async (event) => {
  try {
    const {
      text,
      lang: _lang,
      provider = defaultAudioProvider,
    } = JSON.parse(event.body);

    const lang = _lang?.split("-")?.[0];

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
