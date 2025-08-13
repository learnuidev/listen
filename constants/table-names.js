require("dotenv").config();

/* eslint-disable no-undef */

const tableNames = {
  mediaTable: process.env.MEDIA_TABLE,
  mediaFilesTable: process.env.MEDIA_FILES_TABLE,
  mediaFilesTableV2: process.env.MEDIA_FILES_TABLE_V2,
  userAssetsTable: process.env.USER_ASSETS_TABLE,
  booksTable: process.env.BOOKS_TABLE,
  chapterSectionsTable: process.env.CHAPTER_SECTIONS_TABLE,
  textToSpeechTable: process.env.TEXT_TO_SPEECH_TABLE,
  contentAnalyticsTable: process.env.CONTENT_ANALYTICS_TABLE,
  contentsTable: process.env.CONTENTS_TABLE_V2,
  // contentsV2Table: process.env.CONTENTS_TABLE_V2,
};

module.exports = {
  tableNames,
};
