// 1. update media status: to "generating-transcript"
// 2. send text to speewchify api
// 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

// 4. once s3 is saved, save the s3 key and save it in media-files table
// 5. also store transcript in media-files table as well
// 6. take the id and store it in media table as well as update the status

// 7. once the transcript has been generated, start the translation pipeline
// 8. set the status to translating-transcript
// 9. once the trascript has been translated, set the status to 'transcript-translated'
// Done

const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");
const { getBookById } = require("./get-book.api");
const ulid = require("ulid");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const updateBookApi = async ({ id, ...rest }) => {
  // 1. update media status: to "generating-transcript"

  const book = await getBookById(id);

  let _chapters;
  if (rest.chapters?.length > 0) {
    _chapters = book.chapters.concat(
      rest.chapters.map((chapter) => {
        return removeNull({
          title: chapter.title,
          chapterNumber: chapter?.chapterNumber,
          id: ulid.ulid(),
          createdAt: Date.now(),
        });
      })
    );
  }

  const updatedAttributes = {
    id,
    ...rest,
    chapters: _chapters,
    lastUpdated: Date.now(),
  };
  const updatedMedia = constructParams({
    tableName: tableNames.booksTable,
    attributes: removeNull(updatedAttributes),
    // attributes: params,
  });

  await dynamodb.update(updatedMedia).promise();

  return { ...book, ...updatedAttributes };
};

// updateBookApi({
//   id: "01K0JCW67AX9JRY2ZSD00075TW",
//   chapters: [{ title: "第3章 猫头鹰传书", chapterNumber: 3 }],
// }).then((updatedBook) => {
//   console.log("updated book", updatedBook);
// });

module.exports = {
  updateBookApi,
};
