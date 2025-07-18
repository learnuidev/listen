const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient();

// Middlewares

const { tableNames } = require("../../constants/table-names");

const getMediaById = async (mediaId) => {
  const resp = await dynamodb
    .get({
      Key: {
        id: mediaId,
      },
      TableName: tableNames.mediaTable,
    })
    .promise();

  const media = resp.Item;

  return media;
};

module.exports = {
  getMediaById,
};
