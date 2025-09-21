const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listTranscriptByIdHandler } = require("./list-transcriptions.handler");

module.exports.handler = middy(listTranscriptByIdHandler).use(cors());
