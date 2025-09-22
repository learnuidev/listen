const { tableNames } = require("../../constants/table-names");

/* eslint-disable no-undef */
const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listBookSectionsApi = async ({ bookId, lastEvaulatedKey }) => {
  const params = {
    ExpressionAttributeValues: {
      ":bookId": bookId,
    },
    KeyConditionExpression: "bookId = :bookId",
    IndexName: "byBookId",
    TableName: tableNames.bookSectionsTable,
    Limit: 300,
    ExclusiveStartKey: lastEvaulatedKey,
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.Items?.length === 0) {
    return {
      items: [],
      lastEvaulatedKey: resp?.LastEvaluatedKey,
    };
  }

  const requestObject = {
    RequestItems: {
      [tableNames.contentsTable]: {
        Keys: resp.Items?.map((item) => {
          return {
            id: item?.id,
          };
        }),
      },
    },
  };

  const respNew = await dynamodb.batchGet(requestObject).promise();

  const itemsVal = respNew?.Responses?.[tableNames.contentsTable];

  return {
    items: itemsVal
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((item, idx) => {
        return {
          ...item,
          sectionNumber: idx + 1,
        };
      }),
    lastEvaulatedKey: resp?.LastEvaluatedKey,
  };
};

// listSectionsByChapterId({
//   chapterId: "01K0JCW67A44DNY0NB247STYB7",
// }).then((books) => {
//   console.log("books", books);
// });

module.exports = {
  listBookSectionsApi,
};
