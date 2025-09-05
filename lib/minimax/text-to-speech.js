// const { minimaxApiKey, minimaxGroupId } = require("./constants");
const { minimaxApiKeys } = require("./constants");
const { listSystemVoices } = require("./list-system-voices");

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

const minimaxTextToSpeech = async ({
  text,
  lang,
  emotion,
  model,
  apiKeyVersion = minimaxApiKeys.main,
}) => {
  if (!["main", "backup"]?.includes(apiKeyVersion.type)) {
    return;
  }

  const voices = await listSystemVoices({ lang });

  if (!voices || voices?.length === 0) {
    console.log("VOICES NOT FOUND");
  }

  const chineseVoice = {
    id: "Chinese (Mandarin)_Humorous_Elder",
    name: "Humorous Elder",
    createdAt: "2025-01-01",
    lang: "zh",
  };

  const emotionInput = emotionsMap?.[emotion] || emotionsMap.happy;

  const voiceId = lang === "zh" ? chineseVoice.id : voices?.[0]?.id || "Grinch";

  try {
    const bodyParams = {
      model: model || "speech-02-hd",
      text: text,
      stream: false,
      voice_setting: {
        voice_id: voiceId,
        speed: 0.9,
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

    const url = `https://api.minimax.io/v1/t2a_v2?GroupId=${apiKeyVersion.groupId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeyVersion.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyParams),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const respJson = await response.json();

    console.log("RESP JSON", respJson);

    const subtitles = await fetch(respJson.data.subtitle_file);

    const subtitlesJson = await subtitles.json();

    const finalResponse = {
      audio: respJson.data.audio,
      groupId: apiKeyVersion.groupId,
      apiKeyType: apiKeyVersion.type,
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

    return finalResponse;
  } catch (err) {
    if (apiKeyVersion.type === "main") {
      console.log(`Error occured using main account, trying using backup key`);

      return minimaxTextToSpeech({
        text,
        lang,
        emotion,
        model,
        apiKeyVersion: minimaxApiKeys.backup,
      });
    } else {
      throw err;
    }
  }
};

module.exports = {
  minimaxTextToSpeech,
};

// let text = `还真是这样，我的项目就是用这个新版流程搞出来的。现在ai可以直接出带交互甚至比较美观的gui/cli，设计师的工作往后挪了，而且设计师也可以指挥ai实现自己的设计。`;
// minimaxTextToSpeech({
//   text: "你好兄弟",
//   lang: "zh",
//   emotion: "happy",
//   apiKeyVersion: { type: "main", apiKey: "booboo" },
// })
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
