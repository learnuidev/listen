/* eslint-disable no-undef */
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { bucketNames } = require("../../constants/bucket-names");
// const { getPresignedUrl } = require("./get-presigned-url.api");

module.exports.handler = middy(async (event) => {
  const { bucketKey } = JSON.parse(event.body);

  const preSignedUrl = await getPresignedUrl({
    bucketKey,
    bucketName: bucketNames.mediaAssetsBucket,
  });

  // Return Params
  const response = {
    statusCode: 200,
    body: JSON.stringify({ preSignedUrl }),
  };
  return response;
}).use(cors());
