/* eslint-disable no-undef */
require("dotenv").config();

const minimaxApiKey = process.env.MINIMAX_API_KEY;

const minimaxGroupId = process.env.MINIMAX_GROUP_ID;

const minimaxApiKeyV2 = process.env.MINIMAX_API_KEY_V2;
const minimaxGroupIdV2 = process.env.MINIMAX_GROUP_ID_V2;

const minimaxApiKeys = {
  main: {
    type: "main",
    apiKey: minimaxApiKey,
    groupId: minimaxGroupId,
  },
  backup: {
    type: "backup",
    apiKey: minimaxApiKeyV2,
    groupId: minimaxGroupIdV2,
  },
};

module.exports = {
  minimaxApiKeys,
  minimaxApiKey,
  minimaxGroupId,
};
