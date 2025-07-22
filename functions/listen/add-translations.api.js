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
const {
  textToAudio,
  defaultVoiceId,
} = require("../../lib/speechify/text-to-audio");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");
const mime = require("mime-types");
const { mandarinoDeepseek } = require("../../lib/mandarino/mandarino-client");
const {
  generateTranslations,
} = require("../../lib/mandarino/generate-translations");
const { getMediaById } = require("./get-media.api");
const { getMediaFile } = require("./get-media-file.api");

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

function constructSentences(text, lang) {
  if (lang === "zh") {
    return (
      text.includes("。")
        ? text
            .split("。")
            .filter(Boolean)
            .map((textItem) => {
              return `${textItem}。`;
            })
        : [text]
    )
      .map((item) => {
        return [item];
      })
      .flat()
      .map((item) => {
        return {
          input: item,
          lang,
        };
      });
  } else {
    return (
      text.includes(".")
        ? text
            .split(".")
            .filter(Boolean)
            .map((textItem) => {
              return `${textItem}.`;
            })
        : [text]
    )
      .map((item) => {
        if (item?.includes(",")) {
          return (
            item
              ?.split(",")
              // .filter(Boolean)
              .map((textItem, idx, ctx) => {
                if (idx === ctx?.length - 1) {
                  return textItem;
                } else {
                  return `${textItem},`;
                }
              })
          );
        } else {
          return [item];
        }
      })
      .flat()
      .map((item) => {
        return {
          input: item,
          lang,
        };
      });
  }
}

const addTranslationsApi = async (media) => {
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
    // attributes: params,
  });

  await dynamodb.update(updatedContent).promise();

  if (newMedia?.mediaFileId) {
    console.log(`Media file exists skipping...`);

    const mediaFile = await getMediaFile(newMedia?.mediaFileId);

    if (mediaFile?.translations?.length > 0) {
      console.log("Translations exist... skipping");

      return;
    }

    const sentences = constructSentences(newMedia.text, lang).map((item) => {
      // if (idx === 0) {
      //   return {
      //     ...item,
      //     startChunkIndex: 0,
      //     endChunkIndex: item.input.length,
      //   };
      // }

      // const startChunkIndex = ctx
      //   .filter((val, idy) => idy < idx)
      //   .reduce((acc, curr) => {
      //     return acc + curr.input.length;
      //   }, 0);

      const startChunkIndex = newMedia.text.indexOf(item.input);
      const endChunkIndex = startChunkIndex + item?.input?.length;

      return {
        ...item,
        startChunkIndex,
        endChunkIndex,
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

  // 2. send text to speewchify api
  const speechifyResponse = await textToAudio(newMedia.text, {
    voiceId: defaultVoiceId,
    lang,
  });

  console.log(`Speechify transcript generated...`);

  const { audioData, ...rest } = speechifyResponse;

  const base64Data = audioData;

  const contentType = mime.lookup("result.mp3");

  // console.log("SPEECHIFY RESP", speechifyResponse);

  // console.log("CONTENT TYPE", contentType);

  // const audioBuffer = Buffer.from(audioData, "base64");

  // Convert Base64 to Buffer
  // eslint-disable-next-line no-undef
  const audioBuffer = Buffer.from(base64Data, "base64");

  // 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

  console.log(`Fetching upload url...`);
  const resp = await getUploadUrl({
    userId: newMedia.userId,
    contentType,
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  console.log(`Fetched upload url`);

  const { s3Key } = resp;

  // console.log("Resp", resp);

  console.log(`Uploading assets...`);

  // 4. once s3 is saved, save the s3 key and save it in media-files table
  const fetchResponse = await fetch(resp.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: audioBuffer,
  });

  console.log(`Asset successfully uploaded...`);

  // console.log("FETCH RESPONSE", fetchResponse);

  if (!fetchResponse.ok) {
    throw new Error(`Upload failed: ${fetchResponse.statusText}`);
  }

  // 5. also store transcript in media-files table as well
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
  const sentences = constructSentences(newMedia.text, lang).map((item) => {
    // if (idx === 0) {
    //   return {
    //     ...item,
    //     startChunkIndex: 0,
    //     endChunkIndex: item.input.length,
    //   };
    // }

    // const startChunkIndex = ctx
    //   .filter((val, idy) => idy < idx)
    //   .reduce((acc, curr) => {
    //     return acc + curr.input.length;
    //   }, 0);

    const startChunkIndex = newMedia.text.indexOf(item.input);
    const endChunkIndex = startChunkIndex + item?.input?.length;

    return {
      ...item,
      startChunkIndex,
      endChunkIndex,
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
//   id: "01K0RA8ADP7HVYY8MZTEKCNR4X",
// };
// // console.log(constructSentences(mockMedia.text, "zh"));

// addTranslationsApi(mockMedia).then((resp) => {
//   console.log("DONE", resp);
// });

module.exports = {
  addTranslationsApi,
};
