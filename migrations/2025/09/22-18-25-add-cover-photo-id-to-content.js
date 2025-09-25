const AWS = require("aws-sdk");

const { tableNames } = require("../../../constants/table-names");
const { getBookById } = require("../../../functions/book/get-book.api");
const {
  updateContentWithConverPhotoApi,
} = require("../../../functions/book/update-content-with-cover-photo.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const addCoverPhotoIdToContent = async () => {
  const items = await dynamodb
    .scan({
      TableName: tableNames.bookSectionsTable,
    })
    .promise();

  const bookMap = {};

  const contentSections = items?.Items;

  for (const contentSection of contentSections) {
    const bookId = contentSection?.bookId;
    if (!bookMap?.[bookId]) {
      const book = await getBookById(bookId);

      if (book) {
        bookMap[bookId] = book;
      }
    }

    const book = bookMap?.[bookId];

    if (book?.coverPhotoId) {
      console.log(
        `COVER PHOTO ID found ${book?.coverPhotoId} updating content with id ${contentSection?.id}`
      );
      await updateContentWithConverPhotoApi({
        id: contentSection?.id,
        coverPhotoId: book?.coverPhotoId,
      });
    }
  }

  console.log("DONE");
};

addCoverPhotoIdToContent();
