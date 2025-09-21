const mime = require("mime-types");

const { getUploadUrl } = require("../../lib/s3/get-upload-url");
const { bucketNames } = require("../../constants/bucket-names");
const { createAudioDB } = require("./create-audio.db");
const {
  minimaxTextToSpeech,
} = require("../../lib/minimax/minimax-text-to-speech");

const createAudioMinimaxApi = async ({ text, lang, model, emotion }) => {
  const id = `${text}#${lang}#minimax`;

  // 2. send text to speewchify api
  const minimaxResponse = await minimaxTextToSpeech({
    text,
    lang,
    model,
    emotion,
  });

  const contentType = mime.lookup("result.mp3");

  const audioBuffer = minimaxResponse.audio;

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

  const newAudio = await createAudioDB({
    s3Key: resp.s3Key,
    speechMarks: minimaxResponse.speechMarks,
    id,
  });

  return newAudio;
};

module.exports = {
  createAudioMinimaxApi,
};
