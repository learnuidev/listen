const { isLocalEnv } = require("../utils/is-local-env");

/* eslint-disable no-undef */

const tableNamesLocal = {
  mediaTable: "listen-api-dev-MediaTable-1TTNRJRBU6AT2",
  mediaFilesTable: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
  mediaFilesTableV2: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
  userAssetsTable: "nomadmethod-api-dev-UserAssetsTable-10ZRO2B9VGOR7",
};

const tableNames = isLocalEnv()
  ? tableNamesLocal
  : {
      mediaTable: process.env.MEDIA_TABLE,
      mediaFilesTable: process.env.MEDIA_FILES_TABLE,
      mediaFilesTableV2: process.env.MEDIA_FILES_TABLE_V2,
      userAssetsTable: process.env.USER_ASSETS_TABLE,
    };

module.exports = {
  tableNames,
};
