const { isLocalEnv } = require("../utils/is-local-env");

/* eslint-disable no-undef */

const tableNamesLocal = {
  mediaTable: "listen-api-dev-MediaTable-1TTNRJRBU6AT2",
  mediaFilesTable: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
  mediaFilesTableV2: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
};

const tableNames = isLocalEnv()
  ? tableNamesLocal
  : {
      mediaTable: process.env.MEDIA_TABLE,
      mediaFilesTable: process.env.MEDIA_FILES_TABLE,
    };

module.exports = {
  tableNames,
};
