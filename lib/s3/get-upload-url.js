const S3 = require("aws-sdk/clients/s3");
const ulid = require("ulid");

const s3 = new S3({ useAccelerateEndpoint: true });

const getUploadUrl = async ({ userId, contentType, bucketName, extension }) => {
  const id = ulid.ulid();
  let key = `${userId}/${id}`;

  if (extension) {
    if (extension.startsWith(".")) {
      key += extension;
    } else {
      key += `.${extension}`;
    }
  }

  const assetUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    ACL: "public-read",
    ContentType: contentType,
  };
  const signedUrl = s3.getSignedUrl("putObject", params);

  // Return Params
  return { signedUrl, s3Key: key, assetUrl, id };
};

module.exports.getUploadUrl = getUploadUrl;
