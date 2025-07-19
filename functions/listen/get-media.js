// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const AWS = require("aws-sdk");

const { getMediaFile } = require("./get-media-file.api");
const { getMediaById } = require("./get-media.api");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { bucketNames } = require("../../constants/bucket-names");
const { tableNames } = require("../../constants/table-names");

const _getMediaById = async (contentId, userId) => {
  const media = await getMediaById(contentId);

  if (media.userId === userId) {
    return media;
  }

  return null;
};

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getContentByIdHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.claims.email;
    const { mediaId } = JSON.parse(event.body);

    const media = await _getMediaById(mediaId, userId);

    if (!media) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Not found" }),
      };

      return response;
    }

    if (media?.customAudioId) {
      const userAsset = (
        await dynamodb
          .get({
            TableName: tableNames.userAssetsTable,
            Key: {
              id: media.customAudioId,
            },
          })
          .promise()
      )?.Item;

      const audioUrl = await getPresignedUrl({
        bucketName: bucketNames.mediaAssetsBucket,
        bucketKey: userAsset.uploadBucketKey,
      });

      media.customAudioUrl = audioUrl.preSignedUrl;
    }

    if (media?.mediaFileId) {
      const mediaFile = await getMediaFile(media.mediaFileId);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          ...media,
          mediaFile,
        }),
      };

      return response;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(media),
    };

    return response;
  } catch (err) {
    console.log("ERR", err);
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Error! Something went wrong" }),
    };

    return response;
  }
};

module.exports.handler = middy(getContentByIdHandler).use(cors());
