const { getAudioByIdApi } = require("./get-audio-by-id.api");
const { createAudioApi } = require("./create-audio.api");

const getAudioApi = async ({ text, lang }) => {
  let audio = await getAudioByIdApi({ text, lang });

  if (audio) {
    return audio;
  } else {
    await createAudioApi({ text, lang });

    const audio = await getAudioByIdApi({ text, lang });

    return audio;
  }
};

module.exports = {
  getAudioApi,
};
