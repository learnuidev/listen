const AWS = require("aws-sdk");
const { removeNull } = require("../../utils/remove-null");
const { tableNames } = require("../../constants/table-names");
const ulid = require("ulid");

// Middlewares

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const addChapterSectionsApi = async ({ chapterId, sections }) => {
  // Prepare the batch write parameters
  const params = {
    RequestItems: {
      [tableNames.chapterSectionsTable]: sections.map((section) => ({
        PutRequest: {
          Item: removeNull({
            chapterId,
            title: section.title?.slice(0, 48),
            sectionNumber: section?.sectionNumber,
            id: ulid.ulid(),
            mediaId: section?.mediaId,
            createdAt: Date.now(),
          }),
        },
      })),
    },
  };

  await dynamodb.batchWrite(params).promise();

  return {
    success: true,
  };
};

// addChapterSectionsApi({
//   chapterId: "01K0JCW67A44DNY0NB247STYB7",
//   sections: [
//     {
//       mediaId: "01K0F48NM7SYWHXD9B223KQARA",
//       sectionNumber: 3,
//     },
//   ],
// }).then((resp) => {
//   console.log("SUCCESS", resp);
// });

module.exports = {
  addChapterSectionsApi,
};
