const ulid = require("ulid");
const { listMinimaxVoicesApi } = require("./list-voices");
const { minimaxGroupId, minimaxApiKey } = require("./constants");

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

const DEFAULT_MODEL = "speech-2.8-hd";

const chineseVoice = {
  id: "moss_audio_caaf07f7-2e83-11f1-acb3-5e90f111d752",
  name: "小龙",
  createdAt: "2025-01-01",
  lang: "zh",
};

const minimaxTextToSpeechApi = async ({ text, lang, emotion, model }) => {
  const apiKey = minimaxApiKey;
  const groupId = minimaxGroupId;
  const voices = await listMinimaxVoicesApi({
    lang,
    apiKey,
  });

  if ((!voices || voices?.length === 0) && lang !== "zh") {
    return {
      error: true,
      type: "VOICES_NOT_FOUND",
      message: "text too long",
    };
  }

  const emotionInput = emotionsMap?.[emotion] || emotionsMap.neutral;

  const voiceId = lang === "zh" ? chineseVoice.id : voices?.[0]?.voice_id;

  if (!voiceId) {
    return {
      error: true,
      type: "VOICE_ID_NOT_FOUND",
      message: "Voice ID not found",
    };
  }

  try {
    const bodyParams = {
      model: model || DEFAULT_MODEL,
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

    const url = `https://api.minimax.io/v1/t2a_v2?GroupId=${groupId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyParams),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const respJson = await response.json();

    if (respJson.base_resp?.status_msg === "invalid params, text too long") {
      return {
        error: true,
        type: "VALIDATION:TEXT_TOO_LONG",
        message: "text too long",
      };
    }

    if (
      ["insufficient credit", "insufficient balance"]?.includes(
        respJson.base_resp?.status_msg
      )
    ) {
      return {
        error: true,
        type: "FINANCE:INSUFFICIENT_CREDIT",
        message: "insufficient credit",
      };
    }

    const subtitles = await fetch(respJson.data.subtitle_file);

    const subtitlesJson = await subtitles.json();

    const chunks = {
      value: text,
      chunks: subtitlesJson.map((subtitle) => {
        return {
          id: ulid.ulid(),
          type: "word",
          start: subtitle.text_begin,
          end: subtitle.text_end,
          startTime: subtitle.time_begin,
          endTime: subtitle.time_end,
          value: subtitle.text,
        };
      }),
    };

    const sentences = chunks?.chunks?.map((chunk) => {
      return {
        id: ulid.ulid(),
        lang,
        input: chunk?.value,
        startIndex: chunk?.start,
        endIndex: chunk?.end,
        start: (chunk?.startTime || 0) / 1000,
        end: chunk?.endTime / 1000,
      };
    });

    // eslint-disable-next-line no-undef
    const audioBuffer = Buffer.from(respJson.data.audio, "hex");

    const finalResponse = {
      audio: audioBuffer,

      creditsUsed: respJson?.extra_info?.usage_characters,
      wordCount: respJson?.extra_info?.word_count,
      sentences,
      serviceProvider: "minimax",
      voiceId,
    };

    return finalResponse;
  } catch (err) {
    return {
      error: true,
      type: "UNKNOWN",
      message: err.message,
    };
  }
};

module.exports = {
  minimaxTextToSpeechApi,
};

// minimaxTextToSpeechApi({
//   text: "El mundo es tuyo, así que disfrútalo.",
//   lang: "es",
//   provider: "minimax",
// }).then((resp) => {
//   console.log("RESP", resp);
// });
