const { getAudioByIdApi } = require("./get-audio-by-id.api");
const { createAudioApi } = require("./create-audio.api");
const { textToAudio } = require("../../lib/narakeet/text-to-audio");
const { createAudioMinimaxApi } = require("./create-audio-minimax.api");

const getAudioApi = async ({ text, lang, provider }) => {
  if (!text || !lang) {
    throw new Error("Lang or text required");
  }

  let audio = await getAudioByIdApi({ text, lang, provider });
  audio = null;

  if (audio) {
    return audio;
  } else {
    if (provider === "narakeet") {
      await textToAudio({ text, lang, provider });
    }

    if (provider === "minimax") {
      await createAudioMinimaxApi({ text, lang, provider });
    } else {
      await createAudioApi({ text, lang, provider });
    }

    const audio = await getAudioByIdApi({ text, lang, provider });

    return audio;
  }
};

// const resp = {
//   text: "麦苏雅和丈夫被关了起来。",
//   lang: "zh",
//   provider: "minimax",
// };

// test case 1: throws error
// getAudioApi({ text: "脱逃" }).then((resp) => {
//   console.log("resp", resp);
// });
// getAudioApi({ text: resp.text, lang: "zh", provider: "minimax" }).then(
//   (resp) => {
//     console.log("resp", JSON.stringify(resp));
//   }
// );

module.exports = {
  getAudioApi,
};
