const { speechifyApiKey } = require("../../constants/api-keys");
const { speechifyClient } = require("./speechify-client");

const textToAudioStream = async (
  text,
  { voiceId } = { voiceId: "aliabdaal" }
) => {
  const url = "https://api.sws.speechify.com/v1/audio/stream";
  const options = {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      Authorization: `Bearer ${speechifyApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text, voice_id: voiceId }),
  };

  const response = await fetch(url, options);
  //   const data = await response.json();

  return response;

  //   return speechifyClient.tts.audio.stream({}, {
  //     input: text,
  //     voiceId,
  //     audioFormat: "mp3",
  //   });
};

textToAudioStream("hello world").then((resp) => {
  console.log("RESP", resp);
});

module.exports = {
  textToAudioStream,
};
