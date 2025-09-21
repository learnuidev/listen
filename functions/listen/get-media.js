// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getMediaFile } = require("./get-media-file.api");
const { getMediaById } = require("./get-media.api");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { bucketNames } = require("../../constants/bucket-names");
const { getUserAsset } = require("../book/get-user-asset.api");

const _getMediaById = async (contentId, userId) => {
  const media = await getMediaById(contentId);

  if (media.userId === userId) {
    return media;
  }

  return null;
};

const getMediaByIdApi = async ({ userId, mediaId }) => {
  const media = await _getMediaById(mediaId, userId);

  if (!media) {
    return;
  }

  if (media?.customAudioId) {
    const userAsset = await getUserAsset(media.customAudioId);

    const audioUrl = await getPresignedUrl({
      bucketName: bucketNames.mediaAssetsBucket,
      bucketKey: userAsset.uploadBucketKey,
    });

    media.customAudioUrl = audioUrl.preSignedUrl;
  }

  if (media?.mediaFileId) {
    const mediaFile = await getMediaFile(media.mediaFileId);

    return {
      ...media,
      mediaFile,
    };
  }

  return media;
};
const getContentByIdHandler = async (event) => {
  const userId = event.requestContext.authorizer.claims.email;
  const { mediaId } = JSON.parse(event.body);

  try {
    const media = await getMediaByIdApi({ userId, mediaId });

    if (!media) {
      const response = {
        statuCide: 404,
        body: JSON.stringify({ message: "Not found" }),
      };

      return response;
    }

    const response = {
      statuCide: 200,
      body: JSON.stringify(media),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Error! Something went wrong" }),
    };

    return response;
  }
};

module.exports.handler = middy(getContentByIdHandler).use(cors());
