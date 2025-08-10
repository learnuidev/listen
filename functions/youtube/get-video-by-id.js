const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getVideoByIdHandler } = require("./get-video-by-id.handler");

module.exports.handler = middy(getVideoByIdHandler).use(cors());
