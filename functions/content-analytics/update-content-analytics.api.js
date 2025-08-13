const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");
const { getContentAnalyticsApi } = require("./get-content-analytics.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

function aggregateRepeats(arr1, arr2) {
  const map = new Map();

  // Helper to add or update entries in the map
  function addToMap(arr) {
    arr.forEach((item) => {
      const key = item.transcriptionId;
      if (map.has(key)) {
        map.set(key, {
          transcriptionId: key,
          totalRepeats: map.get(key).totalRepeats + item.totalRepeats,
        });
      } else {
        map.set(key, { ...item });
      }
    });
  }

  addToMap(arr1);
  addToMap(arr2);

  return Array.from(map.values());
}

function aggregateWordRepeats(arr1, arr2) {
  const map = new Map();

  // Helper to add or update entries in the map
  function addToMap(arr) {
    arr.forEach((item) => {
      const key = item.word;
      if (map.has(key)) {
        map.set(key, {
          word: key,
          frequency: map.get(key).frequency + item.frequency,
        });
      } else {
        map.set(key, { ...item });
      }
    });
  }

  addToMap(arr1);
  addToMap(arr2);

  return Array.from(map.values());
}

const updateContentAnalyticsApi = async ({ userId, contentId, ...rest }) => {
  // 1. update media status: to "generating-transcript"
  const id = `${contentId}#${userId}`;

  const contentAnalytics = await getContentAnalyticsApi({ userId, contentId });

  const remoteContentAnalyticsRepeatsPerTranscription =
    contentAnalytics?.repeatsPerTranscription || [];

  const remoteWordRepeats = contentAnalytics?.repeatsPerWord || [];
  const newRepeats = rest?.repeatsPerWord || [];

  const updatedRepeats = aggregateWordRepeats(remoteWordRepeats, newRepeats);

  const newContentAnalyticsRepeatsPerTranscription =
    rest?.repeatsPerTranscription || [];

  const updatedRepeatsPerTranscription = aggregateRepeats(
    remoteContentAnalyticsRepeatsPerTranscription,
    newContentAnalyticsRepeatsPerTranscription
  );

  const updatedStats = {
    ...rest,
    totalRepeats:
      (contentAnalytics?.totalRepeats || 0) + (rest?.totalRepeats || 0),
    totalPlays: (contentAnalytics?.totalPlays || 0) + (rest?.totalRepeats || 0),
    totalTimePlayed:
      (contentAnalytics?.totalTimePlayed || 0) + (rest?.totalTimePlayed || 0),
    repeatsPerTranscription: updatedRepeatsPerTranscription,
    repeatsPerWord: updatedRepeats,
  };

  const updatedAttributes = {
    id,
    ...updatedStats,
    lastUpdated: Date.now(),
  };

  const updatedContentAnalytics = constructParams({
    tableName: tableNames.contentAnalyticsTable,
    attributes: removeNull(updatedAttributes),
    // attributes: params,
  });

  await dynamodb.update(updatedContentAnalytics).promise();

  return { ...contentAnalytics, ...updatedAttributes };
};

module.exports = {
  updateContentAnalyticsApi,
};
