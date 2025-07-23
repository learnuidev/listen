/* eslint-disable no-unused-vars */
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
const { getVoice } = require("./narakeet-voices");

async function textToAudio({ text, lang, speed, volume }) {
  const id = `${text}#${lang}`;

  const voiceSpeed = speed || 1;
  const voiceVolume = volume || "standard";

  const voice = getVoice(lang);

  const resp = await getUploadUrl({
    contentType: mime.lookup("result.mp3"),
    bucketName: bucketNames.mediaAssetsBucket,
    extension: "mp3",
  });

  const { s3Key } = resp;

  // Create a PassThrough stream
  const passThrough = new PassThrough();

  const response = await fetch(
    `https://api.narakeet.com/text-to-speech/m4a?voice=${voice}&voice-speed=${voiceSpeed}&voice-volume=${voiceVolume}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-api-key": narakeetApiKey,
        accept: "application/octet-stream",
      },
      body: text,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Write temporary result to writable file
  const tempFilePath = "/tmp/result.m4a";
  const fileStream = fs.createWriteStream(tempFilePath);

  const reader = response.body.getReader();

  async function pump() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const buffer = Buffer.from(value);
      passThrough.write(buffer);
      fileStream.write(buffer);
    }
    passThrough.end();
    fileStream.end();
  }

  await pump(); // Wait for file stream and passThrough to complete

  fileStream.on("finish", () => {
    console.log("Audio file saved temporarily at", tempFilePath);
  });

  // Upload to S3 using PassThrough
  const parallelUploads3 = new Upload({
    client: new S3({}),
    params: {
      Bucket: bucketNames.mediaAssetsBucket,
      Key: s3Key,
      Body: fs.createReadStream(tempFilePath), // Upload from file stored in /tmp
    },
  });

  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  await parallelUploads3.done();

  const newAudio = await createAudioDB({
    s3Key: resp.s3Key,
    voice,
    id,
  });

  return newAudio;
}

module.exports = {
  textToAudio,
};

// textToAudio({
//   text: "不要总是怪别人。",
//   lang: "zh",
// }).then((resp) => {
//   console.log("audio", resp);
// });
