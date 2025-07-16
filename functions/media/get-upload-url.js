const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { contentType = "image/jpeg", extension = ".jpeg" } = JSON.parse(
    event.body
  );

  const resp = await getUploadUrl({
    userId,
    contentType,
    extension,
    bucketName: bucketNames.mediaAssetsBucket,
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify(resp),
  };

  return response;
}).use(cors());
