const AWS = require("aws-sdk");
const { removeNull } = require("../../utils/remove-null");
const { tableNames } = require("../../constants/table-names");
const {
  updateContentWithConverPhotoApi,
} = require("./update-content-with-cover-photo.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const addBookSectionApi = async ({
  sectionId,
  bookId,
  coverPhotoId,
  ...rest
}) => {
  const newBookSection = removeNull({
    id: sectionId,
    bookId,
    createdAt: Date.now(),
    ...rest,
  });
  await dynamodb
    .put({
      TableName: tableNames.bookSectionsTable,
      Item: newBookSection,
    })
    .promise();

  await updateContentWithConverPhotoApi({ id: sectionId, coverPhotoId });

  return newBookSection;
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
  addBookSectionApi,
};
