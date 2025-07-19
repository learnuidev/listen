const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const ulid = require("ulid");
const { removeNull } = require("../../utils/remove-null");

const addBookApi = async ({ userId, title, author, chapters, tags }) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: "us-east-1",
  });

  const id = ulid.ulid();

  let _chapters = null;

  if (chapters?.length > 0) {
    _chapters = chapters?.map((chapter) => {
      return removeNull({
        title: chapter.title,
        chapterNumber: chapter?.chapterNumber,
        id: ulid.ulid(),
        createdAt: Date.now(),
      });
    });
  }

  const params = removeNull({
    id,
    userId,
    title,
    author,
    tags,
    chapters: _chapters,
    createdAt: Date.now(),
  });

  const inputParams = {
    Item: params,
    TableName: tableNames.booksTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addBookApi,
};

// addBookApi({
//   userId: "learnuidev@gmail.com",
//   title: "哈利·波特与魔法石",
//   author: "J.K. 罗琳",
//   chapters: [
//     {
//       title: "第1章 大难不死的男孩",
//       chapterNumber: 1,
//     },
//     {
//       title: "第2章 悄悄消失的玻璃",
//       chapterNumber: 2,
//     },
//   ],
// }).then((newBook) => {
//   console.log("new book", newBook);
// });
