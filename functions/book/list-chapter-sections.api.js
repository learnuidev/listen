const { tableNames } = require("../../constants/table-names");
const { getMediaById } = require("../listen/get-media.api");

/* eslint-disable no-undef */
const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listSectionsByChapterId = async ({ chapterId, lastEvaulatedKey }) => {
  const params = {
    ExpressionAttributeValues: {
      ":chapterId": chapterId,
    },
    KeyConditionExpression: "chapterId = :chapterId",
    IndexName: "byChapterId",
    TableName: tableNames.chapterSectionsTable,
    Limit: 100,
    ExclusiveStartKey: lastEvaulatedKey,
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.Items?.length === 0) {
    return {
      items: [],
      lastEvaulatedKey: resp?.LastEvaluatedKey,
    };
  }

  const items = await Promise.all(
    resp?.Items?.map(async (item) => {
      const media = await getMediaById(item?.mediaId);
      return {
        title: item?.title,
        sectionNumber: item?.sectionNumber,
        ...media,
      };
    })
  );

  return {
    items: items,
    lastEvaulatedKey: resp?.LastEvaluatedKey,
  };
};

// listSectionsByChapterId({
//   chapterId: "01K0JCW67A44DNY0NB247STYB7",
// }).then((books) => {
//   console.log("books", books);
// });

module.exports = {
  listSectionsByChapterId,
};
