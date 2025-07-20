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

const { getMediaById } = require("./get-media.api");

const { deleteUserAssetApi } = require("./delete-user-asset.api");
const { deleteMediaFileApi } = require("./delete-media-file.api");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteMediaApi = async ({ mediaId, userId }) => {
  let media = await getMediaById(mediaId);

  media = media?.userId === userId ? media : null;

  if (!media) {
    throw new Error("Media doesnt exist");
  }

  // 1. delete custom audio (record item + s3 assets) if exists
  if (media.customAudioId) {
    console.log("Deleting custom audio id...");
    await deleteUserAssetApi({
      id: media.customAudioId,
      userId: media?.userId,
    });

    return;
  } else {
    console.log("No custom audio id exists, skipping");
  }

  // 2. delete media file + s3 asswets

  if (media.mediaFileId) {
    console.log("Deleting media file...");
    await deleteMediaFileApi({
      id: media.mediaFileId,
      userId: media.userId,
    });
  } else {
    console.log("No media file exists, skipping");
  }
  // 3. delete media
  await dynamodb
    .delete({
      Key: {
        id: mediaId,
      },
      TableName: tableNames.mediaTable,
    })
    .promise();

  return {
    ...media,
    deletedAt: Date.now(),
  };
};

module.exports = {
  deleteMediaApi,
};
