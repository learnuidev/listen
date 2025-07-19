// An endpoints that checks if the character exisits or not
// if it does - then adds pinyin and english, pinyin level, initial and final to the component and saves it
// if it does not then creates a new component and adds pinyin, english, initial, final and group

const AWS = require("aws-sdk");

const { deleteChapterSectionApi } = require("./delete-chapter-section.api");
const { getBookById } = require("./get-book.api");

const { listSectionsByChapterId } = require("./list-chapter-sections.api");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteBookApi = async ({ userId, bookId }) => {
  const book = await getBookById(bookId);

  if (!book) {
    throw new Error("Book not found");
  }

  if (book.userId !== userId) {
    throw new Error("You dont have the permission");
  }

  // delete book contents
  const chapterContents = (
    await Promise.all(
      book.chapters?.map(async (chapter) => {
        const chapterItems = await listSectionsByChapterId({
          chapterId: chapter.id,
        });

        return chapterItems.items;
      })
    )
  ).flat();

  if (chapterContents?.length === 0) {
    console.warn(
      "Chapter contents not found... proceeding on deleting the book"
    );
  }

  if (chapterContents?.length > 0) {
    for (const section of chapterContents) {
      await deleteChapterSectionApi(section.id);
    }

    console.log("Sections deleted");
  }

  // 1. If the content is found, means its an old component
  await dynamodb
    .delete({
      Key: {
        id: bookId,
      },
      TableName: tableNames.booksTable,
    })
    .promise();

  console.log("book deleted");

  return {
    ...book,
    deletedAt: Date.now(),
  };
};

module.exports = {
  deleteBookApi,
};

// test case 1: should throw error
// deleteBookApi({
//   userId: "john.doe@gmail.com",
//   bookId: "01K0JCW67AX9JRY2ZSD00075TW",
// }).catch((error) => {
//   console.log("ERROR", error);
// });

// test case 2: delete book and its chapter contents
// deleteBookApi({
//   userId: "learnuidev@gmail.com",
//   bookId: "01K0JCW67AX9JRY2ZSD00075TW",
// }).then((deletedBook) => {
//   console.log("deletedbook", deletedBook);
// });
