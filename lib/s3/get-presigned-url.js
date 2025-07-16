/* eslint-disable no-undef */
const S3 = require("aws-sdk/clients/s3");
const s3 = new S3({ useAccelerateEndpoint: true });

const getPresignedUrl = async ({ bucketKey, bucketName }) => {
  const params = {
    Bucket: bucketName,
    Key: bucketKey,
    Expires: 60 * 60 * 24,
  };
  const preSignedUrl = s3.getSignedUrl("getObject", params);

  return { preSignedUrl };
};

module.exports = {
  getPresignedUrl,
};
