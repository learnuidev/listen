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
const ulid = require("ulid");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");
const mime = require("mime-types");
const { mandarinoDeepseek } = require("../../lib/mandarino/mandarino-client");
const {
  generateTranslations,
} = require("../../lib/mandarino/generate-translations");
const { getMediaById } = require("./get-media.api");
const { getMediaFile } = require("./get-media-file.api");
const { minimaxTextToSpeech } = require("../../lib/minimax/text-to-speech");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

async function createMediaFile(input) {
  const { userId, s3Key, ...rest } = input;
  const id = ulid.ulid();
  const params = removeNull({
    s3Key,
    id,
    userId,
    ...rest,
    lastUpdated: Date.now(),
  });

  const inputParams = {
    Item: params,
    TableName: tableNames.mediaFilesTable,
  };

  await dynamodb.put(inputParams).promise();

  return params;
}

async function minimaxTextToSpeechApi({ text, lang, userId }) {
  // 2. send text to speewchify api
  const { audio, ...rest } = await minimaxTextToSpeech({ text, lang });

  const hexString = audio;

  const contentType = mime.lookup("result.mp3");

  // Convert Hex to Buffer
  // eslint-disable-next-line no-undef
  const audioBuffer = Buffer.from(hexString, "hex");

  // 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

  const resp = await getUploadUrl({
    userId,
    contentType,
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  // 4. once s3 is saved, save the s3 key and save it in media-files table
  const fetchResponse = await fetch(resp.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: audioBuffer,
  });

  if (!fetchResponse.ok) {
    throw new Error(`Upload failed: ${fetchResponse.statusText}`);
  }

  // const speechMarks = {
  //   type: "sentence",
  //   start: 0,
  //   end: 25,
  //   startTime: 0,
  //   endTime: 4978,
  //   value: "中产 阶级 。 这个 阶级 代表 中国 城乡 资本 主义 的 生产 关系 。",
  //   chunks: [
  //     {
  //       type: "word",
  //       start: 0,
  //       end: 2,
  //       startTime: 0,
  //       endTime: 755,
  //       value: "中产",
  //     },
  //   ],
  // };

  return {
    s3Key: resp.s3Key,
    ...rest,
  };
}

const addTranslationsMinimaxApi = async (media) => {
  console.log(`Fetching media of id: ${media.id}`);
  const newMedia = await getMediaById(media.id);

  console.log("media successfully fetched");
  let statusHistory = [];

  console.log(`Detecting language...`);
  const lang = await mandarinoDeepseek.detectLanguage({
    content: newMedia.text,
  });

  console.log(`Langauge successfully detected: ${lang}`);

  statusHistory = statusHistory.concat({
    type: "generating-transcript",
    createdAt: Date.now(),
  });

  console.log(`Generating script`);

  // 1. update media status: to "generating-transcript"
  const updatedContent = constructParams({
    tableName: tableNames.mediaTable,
    attributes: removeNull({
      id: newMedia.id,
      status: "generating-transcript",
      lang,
      statusHistory,
      lastUpdated: Date.now(),
    }),
  });

  await dynamodb.update(updatedContent).promise();

  if (newMedia?.mediaFileId) {
    console.log(`Media file exists skipping...`);

    const mediaFile = await getMediaFile(newMedia?.mediaFileId);

    // console.log("mediaFile", mediaFile);

    const chunks = mediaFile?.speechMarks?.chunks;

    if (mediaFile?.translations?.length > 0) {
      console.log("Translations exist... skipping");

      return;
    }

    const sentences = chunks?.map((chunk) => {
      return {
        lang,
        input: chunk?.value,
        startChunkIndex: chunk?.start,
        endChunkIndex: chunk?.end,
        startTime: chunk?.startTime,
        endTime: chunk?.endTime,
      };
    });

    const translations = await generateTranslations(sentences);

    console.log(`Sentences successfully translated...`);

    await dynamodb
      .update(
        constructParams({
          tableName: tableNames.mediaFilesTable,
          attributes: removeNull({
            id: mediaFile.id,
            translations,
            lastUpdated: Date.now(),
          }),
        })
      )
      .promise();

    // 9. once the trascript has been translated, set the status to 'transcript-translated'
    statusHistory = statusHistory.concat({
      type: "transcript-translated",
      createdAt: Date.now(),
    });

    await dynamodb
      .update(
        constructParams({
          tableName: tableNames.mediaTable,
          attributes: removeNull({
            id: newMedia.id,
            mediaFileId: mediaFile.id,
            statusHistory,
            status: "transcript-translated",
            lastUpdated: Date.now(),
          }),
        })
      )
      .promise();

    return true;
  }

  const { s3Key, ...rest } = await minimaxTextToSpeechApi({
    text: newMedia.text,
    lang,
    userId: newMedia.userId,
  });

  console.log(`Creating media file...`);
  const mediaFile = await createMediaFile({ s3Key, ...rest });

  console.log(`Media file created...`);

  // 6. take the id and store it in media table as well as update the status
  statusHistory = statusHistory.concat({
    type: "transcript-generated",
    createdAt: Date.now(),
  });
  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          s3Key,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "transcript-generated",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  // 7. once the transcript has been generated, start the translation pipeline (future work)

  // 8. set the status to translating-transcript
  statusHistory = statusHistory.concat({
    type: "translating-transcript",
    createdAt: Date.now(),
  });
  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          s3Key,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "translating-transcript",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  console.log(`Translating sentencees...`);

  const chunks = rest?.speechMarks?.chunks;

  const sentences = chunks?.map((chunk) => {
    return {
      lang,
      input: chunk?.value,
      startChunkIndex: chunk?.start,
      endChunkIndex: chunk?.end,
      startTime: chunk?.startTime,
      endTime: chunk?.endTime,
    };
  });

  const translations = await generateTranslations(sentences);

  console.log(`Sentences successfully translated...`);

  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaFilesTable,
        attributes: removeNull({
          id: mediaFile.id,
          translations,
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  // 9. once the trascript has been translated, set the status to 'transcript-translated'
  statusHistory = statusHistory.concat({
    type: "transcript-translated",
    createdAt: Date.now(),
  });

  await dynamodb
    .update(
      constructParams({
        tableName: tableNames.mediaTable,
        attributes: removeNull({
          id: newMedia.id,
          mediaFileId: mediaFile.id,
          statusHistory,
          status: "transcript-translated",
          lastUpdated: Date.now(),
        }),
      })
    )
    .promise();

  return true;
};

// eslint-disable-next-line no-unused-vars
// const mockMedia = {
//   id: "01K237TFPDMZ4D4CPWQ4VGBGEG",
// };
// // // console.log(constructSentences(mockMedia.text, "zh"));

// addTranslationsMinimaxApi(mockMedia).then((resp) => {
//   console.log("DONE", resp);
// });

module.exports = {
  addTranslationsMinimaxApi,
};
