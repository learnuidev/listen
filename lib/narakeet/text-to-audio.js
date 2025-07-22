const { Upload } = require("@aws-sdk/lib-storage");

// const fetch = require("node-fetch");
const fs = require("fs");

const { S3Client, S3 } = require("@aws-sdk/client-s3");

const mime = require("mime-types");
const { PassThrough } = require("stream");

const { bucketNames } = require("../../constants/bucket-names");
const { getUploadUrl } = require("../s3/get-upload-url");
const { narakeetApiKey } = require("../../constants/api-keys");
const { createAudioDB } = require("../../functions/jetto/create-audio.db");

async function textToAudio({ text, lang }) {
  const id = `${text}#${lang}`;

  const resp = await getUploadUrl({
    contentType: mime.lookup("result.m4a"),
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  const { s3Key } = resp;

  // Create a PassThrough stream
  const passThrough = new PassThrough();

  const response = await fetch("https://api.narakeet.com/text-to-speech/m4a", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "x-api-key": narakeetApiKey,
      accept: "application/octet-stream",
    },
    body: text,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const fileStream = fs.createWriteStream("result.m4a");

  // Manually pump data from Web ReadableStream to Node.js PassThrough
  const reader = response.body.getReader();

  async function pump() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // eslint-disable-next-line no-undef
      passThrough.write(Buffer.from(value));
    }
    passThrough.end();
  }

  pump();

  passThrough.pipe(fileStream);

  fileStream.on("finish", () => {
    console.log("Audio file saved as result.m4a");
  });

  const parallelUploads3 = new Upload({
    client: new S3({}) || new S3Client({}),
    params: {
      Bucket: bucketNames.mediaAssetsBucket,
      Key: s3Key,
      Body: passThrough,
    },
  });

  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  await parallelUploads3.done();

  const newAudio = await createAudioDB({
    s3Key: resp.s3Key,
    id,
  });

  return newAudio;
}

module.exports = {
  textToAudio,
};

// textToAudio({
//   text: "互相理解很重要。",
//   lang: "zh",
// }).then((resp) => {
//   console.log("audio", resp);
// });
