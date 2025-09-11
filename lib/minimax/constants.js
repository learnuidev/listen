/* eslint-disable no-undef */
require("dotenv").config();

const minimaxApiKey = process.env.MINIMAX_API_KEY;

const minimaxGroupId = process.env.MINIMAX_GROUP_ID;

const minimaxApiKeyV2 = process.env.MINIMAX_API_KEY_V2;
const minimaxGroupIdV2 = process.env.MINIMAX_GROUP_ID_V2;

const minimaxApiKeyV3 = process.env.MINIMAX_API_KEY_V3;
const minimaxGroupIdV3 = process.env.MINIMAX_GROUP_ID_V3;

const minimaxApiKeys = [
  {
    type: "main",
    apiKey: minimaxApiKey,
    groupId: minimaxGroupId,
  },

  {
    type: "backup",
    apiKey: minimaxApiKeyV2,
    groupId: minimaxGroupIdV2,
  },
  {
    type: "backup-v2",
    apiKey: minimaxApiKeyV3,
    groupId: minimaxGroupIdV3,
  },
];

module.exports = {
  minimaxApiKeys,
  minimaxApiKey,
  minimaxGroupId,
};
