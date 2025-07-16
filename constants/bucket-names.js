const { isLocalEnv } = require("../utils/is-local-env");

const bucketNamesLocal = {
  mediaAssetsBucket: "listen-api-dev-mediaassetsbucket-22ud0bjy3xgr",
};

const bucketNames = isLocalEnv()
  ? bucketNamesLocal
  : {
      // eslint-disable-next-line no-undef
      mediaAssetsBucket: process.env.MEDIA_ASSETS_BUCKET,
    };

module.exports = {
  bucketNames,
};
