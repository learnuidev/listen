/* eslint-disable no-undef */
require("dotenv").config();

const openAiApiKey = process.env.OPENAI_API_KEY;

const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
const falApiKey = process.env.FAL_API_KEY;
const moonshotApiKey = process.env.MOONSHOT_API_KEY;

const qwenApiKey = process.env.QWEN_API_KEY;

const mistralApiKey = process.env.MISTRAL_API_KEY;

const narakeetApiKey = process.env.NARAKEET_API_KEY;
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const speechifyApiKey = process.env.SPEECHIFY_API_KEY;

const googleXApiKey = process.env.GOOGLE_X_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const env = process.env.ENV;
const minimaxApiKey = process.env.MINIMAX_API_KEY;

const apiKeys = {
  openAiApiKey,
  deepSeekApiKey,
  moonshotApiKey,
  qwenApiKey,
  mistralApiKey,
  elevenLabsApiKey,
  narakeetApiKey,

  speechifyApiKey,
  googleXApiKey,
  geminiApiKey,
  env,
  minimaxApiKey,
  falApiKey,
};

module.exports = { ...apiKeys };
