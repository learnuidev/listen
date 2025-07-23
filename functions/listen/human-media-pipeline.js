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
const { getMediaById } = require("./get-media.api");
const { bucketNames } = require("../../constants/bucket-names");
const { getPresignedUrl } = require("../../lib/s3/get-presigned-url");
const { openAiApiKey } = require("../../constants/api-keys");
const { chineseConverter } = require("mandarino/src/utils/chinese-converter");

const { parseInput } = require("mandarino/src/utils/parse-input");

const OpenAI = require("openai");
const { speechToText } = require("../../lib/google/speech-to-text");
const { getUserAsset } = require("../book/get-user-asset.api");
const { getMediaFile } = require("./get-media-file.api");
const {
  elevenLabsSpeechToText,
} = require("../../lib/elevenlabs/speech-to-text");

const openai = new OpenAI({
  apiKey: openAiApiKey,
});

// eslint-disable-next-line no-unused-vars
const postProcess = async ({ originalText, aiText, aiChunks }) => {
  const systemContent = `

You are an expert in sentence-level text analysis and revision.

Given the following inputs:

"original_text": The source/original version of the content.
"ai_text": The AI-generated version of the content.
"ai_generated_chunks": Chunks of the AI-generated content to be reviewed.

Your task:

- Compare the original_text and ai_text.
- Identify any discrepancies, inconsistencies, or factual, structural, or stylistic errors between the original_text and ai_text.
- If any issues are identified, revise and correct the ai_generated_chunk to better align with the original_text.
- Please also update the start and end index of the chunks if needed

- Return the revised content as a list of objects formatted in valid stringified JSON, like this.

[
  {
   ...
  }
]

it should have the same object shape as ai chunk object`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemContent,
      },

      {
        role: "user",
        content: `
original_text: ${originalText}
ai generated text: ${aiText}

originalChunk: ${JSON.stringify(aiChunks)}
`,
      },
    ],
    model: "gpt-4o-mini",
  });

  const resp = await chatCompletion?.choices?.[0]?.message?.content;

  try {
    const parsed = parseInput(resp);

    return {
      text: originalText,
      chunks: parsed,
    };
  } catch (err) {
    return {
      text: aiText,
      chunks: aiChunks,
    };
    // const processed = JSON.parse(resp);

    // return processed;
  }

  // const
};

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

// human media pipeline

// 1 user uploads audio
// 2 use elevenlabs to convert audio to text
// 3 save response in media Files under

const audioToTranscriptGemini = async ({ audioUrl, text }) => {
  const response = await speechToText({ audioUrl, text });

  return {
    text,

    words: response.map((word, idx, ctx) => {
      const start = ctx
        ?.slice(0, idx)
        ?.reduce((acc, curr) => acc + curr?.text?.length, 0);

      const end = start + word?.text?.length;

      chineseConverter;
      return {
        speakerId: word?.speaker_id,
        start: idx == 0 ? 0 : start,
        end: idx === 0 ? word?.text?.length : end,
        startTime: word?.start * 1000,
        endTime: word?.end * 1000,
        type: word?.type,
        value: chineseConverter(word?.text),
      };
    }),
  };
};

const updateMediaStatus = async ({ mediaId, status }) => {
  const media = await getMediaById(mediaId);

  const updatedMedia = constructParams({
    tableName: tableNames.mediaTable,
    attributes: removeNull({
      id: mediaId,
      status: media.status.concat(status),
      lastUpdated: Date.now(),
    }),
    // attributes: params,
  });

  await dynamodb.update(updatedMedia).promise();
};

const updateMediaFile = async ({ mediaFileId, humanAudioTimestamps }) => {
  const updatedMediaFile = constructParams({
    tableName: tableNames.mediaFilesTable,
    attributes: removeNull({
      id: mediaFileId,
      humanAudioTimestamps,

      lastUpdated: Date.now(),
    }),
    // attributes: params,
  });

  await dynamodb.update(updatedMediaFile).promise();
};

const humanMediaPipeline = async (updatedMedia) => {
  const media = await getMediaById(updatedMedia.id);

  console.log("MEDIA", media);
  if (!media.customAudioId) {
    console.log("NO custom audio id added, skipping");
    return;
  }

  const mediaFile = await getMediaFile(media?.mediaFileId);

  if (mediaFile?.humanAudioTimestamps) {
    console.log(`Human media file exists.. skipping`);
    return null;
  }

  const userAsset = await getUserAsset(media.customAudioId);

  if (!userAsset) {
    console.log(
      `NO user asset with ${media.customAudioId} exists added.. stopped`
    );
    return;
  }

  // get presigned url
  const audioUrl = await getPresignedUrl({
    bucketName: bucketNames.mediaAssetsBucket,
    bucketKey: userAsset.uploadBucketKey,
  });

  console.log("pre signed url", audioUrl);

  let humanAudioTimestamps;

  // = await audioToTranscriptElevenLabs({
  //   audioUrl: audioUrl.preSignedUrl,
  //   text: media.text,
  // });

  try {
    humanAudioTimestamps = await elevenLabsSpeechToText({
      audioUrl: audioUrl.preSignedUrl,
      text: media.text,
    });
  } catch (err) {
    humanAudioTimestamps = await audioToTranscriptGemini({
      audioUrl: audioUrl.preSignedUrl,
      text: media.text,
    });
  }

  await updateMediaStatus({
    mediaId: updatedMedia.id,
    status: {
      type: "human-audio-timestamps-generated",
      createdAt: Date.now(),
    },
  });

  // await updateMediaStatus({
  //   mediaId: updatedMedia.id,
  //   status: {
  //     type: "human-audio-timestamps-post-processing",
  //     createdAt: Date.now(),
  //   },
  // });

  // const postprocsedWords = await postProcess({
  //   originalText: media.text,
  //   aiText: _humanAudioTimestamps.text,
  //   aiChunks: _humanAudioTimestamps.words,
  // });

  // await updateMediaStatus({
  //   mediaId: updatedMedia.id,
  //   status: {
  //     type: "human-audio-timestamps-post-processed",
  //     createdAt: Date.now(),
  //   },
  // });

  // const humanAudioTimestamps = {
  //   ..._humanAudioTimestamps,
  //   text: postprocsedWords.text,
  //   words: postprocsedWords.chunks,
  // };

  await updateMediaFile({
    mediaFileId: media.mediaFileId,
    humanAudioTimestamps,
  });
};

// humanMediaPipeline({
//   id: "01K0F48NM7SYWHXD9B223KQARA",
// }).then((resp) => {
//   console.log("yoo", resp);
// });

module.exports = {
  humanMediaPipeline,
};
