const { isLocalEnv } = require("../utils/is-local-env");

/* eslint-disable no-undef */

const tableNamesLocal = {
  mediaTable: "listen-api-dev-MediaTable-1TTNRJRBU6AT2",
  mediaFilesTable: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
  mediaFilesTableV2: "listen-api-dev-MediaFilesTable-394TH4YHSPVV",
  userAssetsTable: "nomadmethod-api-dev-UserAssetsTable-10ZRO2B9VGOR7",

  booksTable: "listen-api-dev-BooksTable-NPGUL667QXPY",
  chapterSectionsTable: "listen-api-dev-ChapterSectionsTable-1K5V04WQLPZN2",
  textToSpeechTable: "listen-api-dev-TextToSpeechTable-RKHUASCCQE4Y",
  contentAnalyticsTable: "listen-api-dev-ContentAnalyticsTable-CVUKEXHF5VFT",
  contentsTable: "nomadmethod-api-dev-ContentsTable-NQTY72LN0YJQ",
};

const tableNames = isLocalEnv()
  ? tableNamesLocal
  : {
      mediaTable: process.env.MEDIA_TABLE,
      mediaFilesTable: process.env.MEDIA_FILES_TABLE,
      mediaFilesTableV2: process.env.MEDIA_FILES_TABLE_V2,
      userAssetsTable: process.env.USER_ASSETS_TABLE,
      booksTable: process.env.BOOKS_TABLE,
      chapterSectionsTable: process.env.CHAPTER_SECTIONS_TABLE,
      textToSpeechTable: process.env.TEXT_TO_SPEECH_TABLE,
      contentAnalyticsTable: process.env.CONTENT_ANALYTICS_TABLE,
      contentsTable: process.env.CONTENTS_TABLE,
    };

module.exports = {
  tableNames,
};
