/* eslint-disable no-undef */
// const { minimaxApiKey, minimaxGroupId } = require("./constants");
const { minimaxApi } = require("./minimax-api");

const minimaxTextToSpeech = async ({
  text,
  lang,
  emotion,
  model,

  // apiKeyVersion = minimaxApiKeys.main,
}) => {
  const resp = await minimaxApi.textToSpeech({
    text,
    lang,
    emotion,
    model,
  });

  return resp;
};

module.exports = {
  minimaxTextToSpeech,
};
