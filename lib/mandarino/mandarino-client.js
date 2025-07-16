const { mandarinoApi } = require("mandarino");
const {
  deepSeekApiKey,
  moonshotApiKey,
  qwenApiKey,
  mistralApiKey,
  openAiApiKey,
} = require("../../constants/api-keys");

const mandarinoClient = mandarinoApi({
  variant: "openai",
  apiKey: openAiApiKey,
});

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

const mandarinoMistral = mandarinoApi({
  apiKey: mistralApiKey,
  variant: "mistral",
});

module.exports = {
  mandarinoClient,
  mandarinoQwen,
  mandarinoMoonshot,
  mandarinoDeepseek,
  mandarinoMistral,
};
