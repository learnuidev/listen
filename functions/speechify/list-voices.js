// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listMediaByUserId } = require("./list-medias.api");
const { listVoices } = require("../../lib/speechify/list-voices");

module.exports.handler = middy(async (event) => {
  try {
    const { lang } = JSON.parse(event.body);

    const voices = await listVoices(lang);
    const response = {
      statusCode: 200,
      body: JSON.stringify(voices),
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
