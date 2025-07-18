const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const AWS = require("aws-sdk");
const { stepFunctionArns } = require("../../constants/step-function-arns");
const stepfunctions = new AWS.StepFunctions();

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;
  const { mediaId, type, mediaFileId } = JSON.parse(event.body);

  if (!mediaId || !type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request" }),
    };
  }
  await stepfunctions
    .startExecution({
      stateMachineArn: stepFunctionArns.startMediaPipelineStepFunction,
      input: JSON.stringify({
        mediaFileId,
        type,
        mediaId,
        userId,
      }),
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Media pipeline started" }),
  };
}).use(cors());
