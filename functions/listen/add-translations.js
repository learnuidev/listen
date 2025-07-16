const DynamoDB = require("aws-sdk/clients/dynamodb");

const { addTranslationsApi } = require("./add-translations.api");

module.exports.handler = async (event) => {
  const t0 = performance.now();

  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newMedia = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      await addTranslationsApi(newMedia);

      console.log("done");
    }
  }

  const t1 = performance.now();

  console.log("Time Taken: ", t1 - t0);
};
