const { normalizeLang } = require("../../utils/normalize-lang");
const { listVoices } = require("./list-voices");
const { speechifyClient } = require("./speechify-client");

const defaultVoiceId = "aliabdaal";

const textToAudio = async (
  text,
  { voiceId, lang } = { voiceId: defaultVoiceId, lang: "zh" }
) => {
  const normalizedLang = normalizeLang(lang);

  const voices = await listVoices(lang);

  const _voiceId = voices?.[0]?.id || voiceId || defaultVoiceId;

  console.log("VOICES", voices);
  // const _voiceId = "xiaoyan";

  // console.log("VOICE ID", _voiceId);

  return speechifyClient.tts.audio.speech({
    input: text,
    voiceId: _voiceId,
    audioFormat: "mp3",
    language: normalizedLang,
    model: lang === "en" ? "simba-english" : "simba-multilingual",
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
  defaultVoiceId,
  normalizeLang,
};
