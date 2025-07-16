const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");

const removeNull = require("./libs/utils").removeNull;
const ulid = require("ulid");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    // TODO: Migrate to v3
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    const { text, type } = JSON.parse(event.body);

    const id = ulid.ulid();

    const createdAt = Date.now();

    const params = removeNull({
      status: "file-added",
      id,
      userId,
      type,
      text,
      createdAt,
    });

    const inputParams = {
      Item: params,
      TableName: tableNames.mediaTable,
    };

    await dynamodb.put(inputParams).promise();

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
}).use(cors());
