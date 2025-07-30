const { Polar } = require("@polar-sh/sdk");
const { polarApiConfig } = require("./polar-api-config");

const polarApi = new Polar({
  accessToken: polarApiConfig.accessToken,
  server: polarApiConfig.server,
});

module.exports = {
  polarApi,
};
