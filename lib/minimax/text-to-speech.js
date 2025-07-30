const { minimaxApiKey } = require("../../constants/api-keys");

const groupId = "1950062366355890395"; // replace with your actual group ID

const url = `https://api.minimax.io/v1/t2a_v2?GroupId=${groupId}`;

const textToSpeech = async ({ text }) => {
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${minimaxApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //   model: "speech-02-hd",
      model: "speech-01-turbo",
      text: text,
      stream: false,
      voice_setting: {
        voice_id: "Grinch",
        speed: 1,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1,
      },
      subtitle_enable: true,
    }),
  }).then((response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  });
};

// textToSpeech({ text: "你好，兄弟！你今天学习什么！" })
//   .then((result) => {
//     console.log("API response:", result);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

const subUrl = `https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/audio%2Ftts-20250729142429-qAsyamYo.title?Expires=1753856669&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=ZxMBTDG8yk7FxXRwOMvEnlwn4jY%3D`;

fetch(subUrl)
  .then((resp) => {
    return resp.json();
  })
  .then((str) => {
    console.log("STR", str);
  });
