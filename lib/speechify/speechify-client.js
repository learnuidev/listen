const { SpeechifyClient } = require("@speechify/api");
const { speechifyApiKey } = require("../../constants/api-keys");

const speechifyClient = new SpeechifyClient({ token: speechifyApiKey });

module.exports = {
  speechifyClient,
};
