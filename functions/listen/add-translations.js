const DynamoDB = require("aws-sdk/clients/dynamodb");

const { addTranslationsApi } = require("./add-translations.api");
const { humanMediaPipeline } = require("./human-media-pipeline");

module.exports.handler = async (event) => {
  const t0 = performance.now();

  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newMedia = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      await addTranslationsApi(newMedia);
      console.log("Added");
      return;
    }

    if (record.eventName === "MODIFY") {
      const newMedia = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      await humanMediaPipeline(newMedia);

      console.log("Modified");
      return;
    }
  }

  const t1 = performance.now();

  console.log("Time Taken: ", t1 - t0);
};
