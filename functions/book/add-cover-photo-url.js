const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { bucketNames } = require("../../constants/bucket-names");
const { getUserAsset } = require("./get-user-asset.api");

const addCoverPhotoUrl = async (book) => {
  if (book?.coverPhotoId) {
    const userAsset = await getUserAsset(book?.coverPhotoId);

    const audioUrl = await getPresignedUrl({
      bucketName: bucketNames.mediaAssetsBucket,
      bucketKey: userAsset.uploadBucketKey,
    });

    book.coverPhotoUrl = audioUrl.preSignedUrl;

    return book;
  } else {
    return book;
  }
};

module.exports = {
  addCoverPhotoUrl,
};
