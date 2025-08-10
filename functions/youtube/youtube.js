require("dotenv").config();
const { youtube: youtubeApi } = require("@googleapis/youtube");

// eslint-disable-next-line no-undef
const googleApiKey = process.env.YOUTUBE_API_KEY;

const youtube = youtubeApi({
  version: "v3",
  auth: googleApiKey,
});

module.exports = {
  youtube,
};
