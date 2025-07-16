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
const DynamoDB = require("aws-sdk/clients/dynamodb");

const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../utils/remove-null");
const { constructParams } = require("../../utils/construct-params");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = async (event) => {
  const t0 = performance.now();

  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newMedia = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      const params = removeNull({
        id: newMedia.id,
        status: "generating-transcript",
        lastUpdated: Date.now(),
      });

      // 1. generating-transcript
      const updatedContent = constructParams({
        tableName: tableNames.mediaTable,
        attributes: params,
      });

      await dynamodb.update(updatedContent).promise();

      // 2. send text to speewchify api
    }
  }

  const t1 = performance.now();

  console.log("Time Taken: ", t1 - t0);
};
