/* eslint-disable no-undef */
require("dotenv").config();

const { z } = require("zod");

const polarApiSchema = z.object({
  accessToken: z.string(),
  server: z.enum(["production", "sandbox"]),
  successUrl: z.string().url(),
});

const polarInput = {
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.POLAR_SERVER,
  successUrl: process.env.POLAR_SUCCESS_URL,
};

console.log("polar input", polarInput);

// runs into error if this fails :)
const polarApiConfig = polarApiSchema.parse(polarInput);

module.exports = {
  polarApiConfig,
};
// console.log("polarApiConfig", polarApiConfig);
