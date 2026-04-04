const { getAudioByIdApi } = require("./get-audio-by-id.api");
const { createAudioApi } = require("./create-audio.api");
const { narakeetTextToAudio } = require("../../lib/narakeet/text-to-audio");
const { createAudioMinimaxApi } = require("./create-audio-minimax.api");

const getAudioApi = async ({ text, lang, provider }) => {
  if (!text || !lang) {
    throw new Error("Lang or text required");
  }

  let audio = await getAudioByIdApi({ text, lang, provider });

  if (audio) {
    return audio;
  } else {
    if (provider === "narakeet") {
      await narakeetTextToAudio({ text, lang, provider });
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
// getAudioApi({
//   text: `我是美国人成年以后才开始学中文。刚开始的时候一个汉子都不认识，开口也很紧张。现在，我可以用中文聊工作、生活，甚至一些比较复杂的想法。`,
//   lang: "zh",
//   provider: "minimax",
// }).then((resp) => {
//   console.log("resp", resp);
// });
//

module.exports = {
  getAudioApi,
};
