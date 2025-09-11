// const { } = require('mandarino')

const { createMinimaxApi } = require("mandarino");
const { minimaxApiKeys } = require("./constants");

const minimaxApi = createMinimaxApi({ minimaxApiKeys: minimaxApiKeys });

module.exports = {
  minimaxApi,
};
