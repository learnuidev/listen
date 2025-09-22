const { mandarinoApi } = require("mandarino");
const {
  deepSeekApiKey,
  moonshotApiKey,
  qwenApiKey,
  mistralApiKey,
  falApiKey,
  // openAiApiKey,
} = require("../../constants/api-keys");

const mandarinoMoonshot = mandarinoApi({
  variant: "moonshot",
  apiKey: moonshotApiKey,
});

const mandarinoDeepseek = mandarinoApi({
  apiKey: deepSeekApiKey,
  variant: "deepseek",
});

const mandarinoQwen = mandarinoApi({
  apiKey: qwenApiKey,
  variant: "qwen",
});

const mandarinoFal = mandarinoApi({
  apiKey: falApiKey,
  variant: "fal",
});

const mandarinoMistral = mandarinoApi({
  apiKey: mistralApiKey,
  variant: "mistral",
});

module.exports = {
  mandarinoClient: mandarinoDeepseek,
  mandarinoQwen,
  mandarinoMoonshot,
  mandarinoDeepseek,
  mandarinoMistral,
  mandarinoFal,
};
