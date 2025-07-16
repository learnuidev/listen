const { isLocalEnv } = require("../utils/is-local-env");

const bucketNamesLocal = {
  // mediaAssetsBucket: "listen-api-dev-mediaassetsbucket-22ud0bjy3xgr",
  mediaAssetsBucket: "nomadmethod-api-dev-assetsbucket-2u2iqsv5nizc",
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
