const { speechifyClient } = require("./speechify-client");

const defaultVoiceId = "aliabdaal";

const langMap = {
  zh: "zh-CH",
  en: "en",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  pt: "pt-PT",
  "pt-BR": "pt-BR",
  "pt-PT": "pt-PT",
  ar: "ar-AE",
  da: "da-DK",
  nl: "nl-NL",
  et: "et-EE",
  fi: "fi-FI",
  el: "el-GR",
  he: "he-IL",
  hi: "hi-IN",
  it: "it-IT",
  ja: "ja-JP",
  nb: "nb-NO",
  pl: "pl-PL",
  ru: "ru-RU",
  sv: "sv-SE",
  tr: "tr-TR",
  uk: "uk-UA",
  vi: "vi-VN",
  be: "be-BY",
  bn: "bn-IN",
  bg: "bg-BG",
  "zh-HK": "zh-HK",
  ca: "ca-ES",
  hr: "hr-HR",
  cs: "cs-CZ",
  fil: "fil-PH",
  ka: "ka-GE",
  gu: "gu-IN",
  hu: "hu-HU",
  id: "id-ID",
  ko: "ko-KR",
  ms: "ms-MY",
  "zh-CH": "zh-CH",
  mr: "mr-IN",
  ne: "ne-NP",
  fa: "fa-IR",
  ro: "ro-RO",
  sr: "sr-RS",
  sk: "sk-SK",
  ta: "ta-IN",
  te: "te-IN",
  th: "th-TH",
  ur: "ur-PK",
};
function normalizeLang(lang) {
  return langMap[lang] || langMap.zh;
}

const textToAudio = async (
  text,
  { voiceId, lang } = { voiceId: defaultVoiceId, lang: "zh" }
) => {
  const normalizedLang = normalizeLang(lang);

  return speechifyClient.tts.audio.speech({
    input: text,
    voiceId,
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
};
