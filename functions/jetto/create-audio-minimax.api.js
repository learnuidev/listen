const mime = require("mime-types");

// const {
//   textToAudio,
//   defaultVoiceId,
// } = require("../../lib/speechify/text-to-audio");
const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");
const { createAudioDB } = require("./create-audio.db");
const { minimaxTextToSpeech } = require("../../lib/minimax/text-to-speech");
// const { textToAudio } = require("../../lib/speechify/text-to-audio");

const createAudioMinimaxApi = async ({ text, lang, model, emotion }) => {
  const id = `${text}#${lang}#minimax`;

  // 2. send text to speewchify api
  const minimaxResponse = await minimaxTextToSpeech({
    text,
    lang,
    model,
    emotion,
  });

  const hexString = minimaxResponse.audio;

  const contentType = mime.lookup("result.mp3");

  // Convert Hex to Buffer
  // eslint-disable-next-line no-undef
  const audioBuffer = Buffer.from(hexString, "hex");

  // 3. convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

  const resp = await getUploadUrl({
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

  const newAudio = await createAudioDB({
    s3Key: resp.s3Key,
    speechMarks: minimaxResponse.speechMarks,
    id,
  });

  return newAudio;
};

// createAudioMinimaxApi({
//   text: "同时，村民们把麦苏雅和她的丈夫关了起来。",
//   lang: "zh",
// }).then((resp) => {
//   console.log("done", resp);
// });

module.exports = {
  createAudioMinimaxApi,
};
