const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

const { tableNames } = require("../../../constants/table-names");
const {
  getVideoByIdApi,
} = require("../../../functions/youtube/get-video-by-id.api");
const { constructParams } = require("../../../utils/construct-params");
const { removeNull } = require("../../../utils/remove-null");

const scanAllContents = async ({ contentsTable, jwt, key, res = [] }) => {
  const scanResp = await dynamodb
    .scan({ TableName: contentsTable, Limit: 500, ExclusiveStartKey: key })
    .promise();

  const resp = {
    items: scanResp?.Items,
    lastEvaulatedKey: scanResp?.LastEvaluatedKey,
  };

  if (resp?.lastEvaulatedKey) {
    return scanAllContents({
      jwt,
      contentsTable,
      key: resp?.lastEvaulatedKey,
      res: res.concat(resp?.items),
    });
  }

  return res.concat(resp?.items);
};

const updateYoutubeVideos = async () => {
  const contents = await scanAllContents({
    contentsTable: tableNames.contentsTable,
  });

  let res = [];

  for (const content of contents) {
    try {
      if (content.audio) {
        const url = new URL(content.audio);

        if (url.host === "www.youtube.com") {
          const videoId = url.searchParams.get("v");

          try {
            const videoDetails = await getVideoByIdApi({ videoId });

            if (videoDetails) {
              const updatedAttributes = {
                id: content.id,
                author: videoDetails.author,
                thumbnails: videoDetails.thumbnails,
                description: content.description || videoDetails.description,
                updatedAt: Date.now(),
              };
              const updatedYoutubeContent = constructParams({
                tableName: tableNames.contentsTable,
                attributes: removeNull(updatedAttributes),

                // attributes: params,
              });

              await dynamodb.update(updatedYoutubeContent).promise();
            }
          } catch (err) {
            console.log(`Error updating content: [${content.title}]`);
          }
        }
      }
    } catch (err) {
      console.log(`Error with the url`, content.audio);
    }

    res.push(content);

    console.log(
      `${((res?.length / contents?.length) * 100)?.toFixed(1)}% done`
    );
  }

  console.log("done");
};

updateYoutubeVideos();
