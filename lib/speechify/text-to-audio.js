const { speechifyClient } = require("./speechify-client");

const textToAudio = async (text, { voiceId } = { voiceId: "aliabdaal" }) => {
  return speechifyClient.tts.audio.speech({
    input: text,
    voiceId,
  });
};

module.exports = {
  textToAudio,
};
