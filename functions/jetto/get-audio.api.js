const { getAudioByIdApi } = require("./get-audio-by-id.api");
const { createAudioApi } = require("./create-audio.api");

const getAudioApi = async ({ text, lang }) => {
  if (!text || !lang) {
    throw new Error("Lang or text required");
  }

  let audio = await getAudioByIdApi({ text, lang });

  if (audio) {
    return audio;
  } else {
    await createAudioApi({ text, lang });

    const audio = await getAudioByIdApi({ text, lang });

    return audio;
  }
};

// test case 1: throws error
// getAudioApi({ text: "脱逃" }).then((resp) => {
//   console.log("resp", resp);
// });
// getAudioApi({ text: "脱逃", lang: "zh" }).then((resp) => {
//   console.log("resp", JSON.stringify(resp));
// });

module.exports = {
  getAudioApi,
};
