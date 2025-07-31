const { minimaxApiKey } = require("../../constants/api-keys");
const { listSystemVoices } = require("./list-system-voices");

const groupId = "1950062366355890395"; // replace with your actual group ID

const url = `https://api.minimax.io/v1/t2a_v2?GroupId=${groupId}`;

const emotionTypes = [
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "neutral",
];

const emotionsMap = emotionTypes.reduce((acc, curr) => {
  return {
    ...acc,
    [curr]: curr,
  };
}, {});

const textToSpeech = async ({ text, lang, emotion, model }) => {
  const voices = await listSystemVoices({ lang });

  if (!voices || voices?.length === 0) {
    console.log("VOICES NOT FOUND");
  }

  const emotionInput = emotionsMap?.[emotion] || emotionsMap.neutral;

  const voiceId = voices?.[0]?.id || "Grinch";

  const bodyParams = {
    model: model || "speech-02-hd",
    text: text,
    stream: false,
    voice_setting: {
      voice_id: voiceId,
      speed: 1,
      vol: 1,
      pitch: 0,
    },
    emotion: emotionInput,
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1,
    },
    subtitle_enable: true,
  };
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${minimaxApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyParams),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const respJson = await response.json();

    const subtitles = await fetch(respJson.data.subtitle_file);

    const subtitlesJson = await subtitles.json();

    console.log("RESP JSON", respJson);

    return {
      audio: respJson.data.audio,
      speechMarks: {
        value: text,
        chunks: subtitlesJson.map((subtitle) => {
          return {
            type: "word",
            start: subtitle.text_begin,
            end: subtitle.text_end,
            startTime: subtitle.time_begin,
            endTime: subtitle.time_end,
            value: subtitle.text,
          };
        }),
      },
    };
  });
};

module.exports = {
  textToSpeech,
};

// let text = `还真是这样，我的项目就是用这个新版流程搞出来的。现在ai可以直接出带交互甚至比较美观的gui/cli，设计师的工作往后挪了，而且设计师也可以指挥ai实现自己的设计。`;
// textToSpeech({ text, lang: "zh", emotion: "happy" })
//   .then((result) => {
//     console.log("API response:", JSON.stringify(result, null, 4));
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

// const resp = {
//   audio: `...`,
//   speechMarks: {
//     value:
//       "还真是这样，我的项目就是用这个新版流程搞出来的。现在ai可以直接出带交互甚至比较美观的gui/cli，设计师的工作往后挪了，而且设计师也可以指挥ai实现自己的设计。",
//     chunks: [
//       {
//         type: "word",
//         start: 0,
//         end: 24,
//         startTime: 0,
//         endTime: 6761.496598639456,
//         value: "还真是这样，我的项目就是用这个新版流程搞出来的。",
//       },
//       {
//         type: "word",
//         start: 24,
//         end: 82,
//         startTime: 6961.496598639456,
//         endTime: 18158.004535147393,
//         value:
//           "现在ai可以直接出带交互甚至比较美观的gui/cli，设计师的工作往后挪了，而且设计师也可以指挥ai实现自己的设计。",
//       },
//     ],
//   },
// };
