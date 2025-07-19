const { normalizeLang } = require("../../utils/normalize-lang");
const { speechifyClient } = require("./speechify-client");

const listVoices = (lang) => {
  const normalizedLang = normalizeLang(lang);

  console.log("normalized lang", normalizedLang);
  return speechifyClient.tts.voices.list().then((voices) => {
    // return [...new Set(voices.map((item) => item.locale))];

    if (lang === "zh") {
      return voices?.filter((voice) => voice?.locale === "yue-CN");
    }
    return [...voices].filter((item) => {
      return item?.locale === normalizedLang;
    });
  });
};

// listVoices("zh").then((voice) => {
//   console.log("voice", voice);
// });

module.exports = {
  listVoices,
};
