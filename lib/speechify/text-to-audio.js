const { speechifyClient } = require("./speechify-client");

const textToAudio = async (text, { voiceId } = { voiceId: "aliabdaal" }) => {
  return speechifyClient.tts.audio.speech({
    input: text,
    voiceId,
    audioFormat: "mp3",
  });
};

// eslint-disable-next-line no-unused-vars
const exampleResponse = {
  audioData: "long string",
  audioFormat: "wav",
  speechMarks: {
    type: "sentence",
    start: 0,
    end: 25,
    startTime: 0,
    endTime: 4978,
    value: "中产 阶级 。 这个 阶级 代表 中国 城乡 资本 主义 的 生产 关系 。",
    chunks: [
      {
        type: "word",
        start: 0,
        end: 2,
        startTime: 0,
        endTime: 755,
        value: "中产",
      },
    ],
  },
  billableCharactersCount: 50,
};

module.exports = {
  textToAudio,
};
