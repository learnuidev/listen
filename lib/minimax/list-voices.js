const langMap = {
  english: "en",
  chinese: "zh",
  japanese: "ja",
  cantonese: "yue",
  korean: "ko",
  spanish: "es",
  portuguese: "pt",
  french: "fr",
  indonesian: "id",
  german: "de",
  russian: "ru",
  italian: "it",
  dutch: "nl",
  vietnamese: "vi",
  arabic: "ar",
  turkish: "tr",
  ukrainian: "uk",
  thai: "th",
  polish: "pl",
  romanian: "ro",
  greek: "el",
  czech: "cs",
  finnish: "fi",
  hindi: "hi",
};

const voiceTypes = {
  system: "system",
  voice_generation: "voice_generation",
  all: "all",
  voice_cloning: "voice_cloning",
};

// eslint-disable-next-line no-unused-vars
const xiaoLong = {
  voice_id: "383283993567457",
  parent_voice_id: "0",
  voice_name: "小龙",
  tag_list: [],
  file_id: "383282335207504",
  cover_url:
    "https://cdn.hailuoai.video/moss/staging/2024-11-21-14/moss-audio/voice_cover//1732171400945633248-207331589841014.png?x-oss-process=image/resize,p_50/format,webp",
  create_time: 1775128002869,
  update_time: 1775128002869,
  collected: false,
  voice_status: 2,
  sample_audio:
    "https://cdn.hailuoai.video/moss/prod/2026-04-02-19/moss-audio/voice/u_1950062366355890395/demo/1775127923599897000-383282335207504_Chinese_(Mandarin).mp3",
  uniq_id: "moss_audio_caaf07f7-2e83-11f1-acb3-5e90f111d752",
  group_id: "1950062366355890395",
  description: "A young man from China",
  generate_channel: 1,
  tag_items: [
    {
      category: 5,
      name: "Chinese (Mandarin)",
    },
    {
      category: 5,
      name: "Male",
    },
  ],
};
const listMinimaxVoicesApi = ({ voiceType = "all", apiKey, lang }) => {
  const _voiceType = voiceTypes?.[voiceType] || voiceTypes.all;

  return fetch(`https://api.minimax.io/v1/get_voice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice_type: _voiceType,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const resp = await response.json();

    if (resp?.base_resp?.status_msg !== "success") {
      throw new Error(resp?.base_resp?.status_msg);
    }

    const attributesToVoiceType = {
      system_voice: "system",
      voice_generation: "voice_generation",
      all: "all",
      voice_cloning: "voice_cloning",
    };

    const voicesList = Object.entries(resp)
      .filter((item) => {
        return item[1] && Array.isArray(item[1]);
      })
      .map(([key, collection]) => {
        return collection.map((item) => {
          const mainLang = item?.voice_id
            ?.split("_")[0]
            ?.split(" ")[0]
            ?.toLowerCase();
          const langItem = langMap?.[mainLang];

          return {
            lang: langItem,
            type: attributesToVoiceType?.[key],
            ...item,
          };
        });
      })
      .flat()
      .filter((item) => {
        if (lang && voiceType) {
          if (voiceType == "all") {
            return item.lang === lang;
          }

          return item.lang === lang && item.type === voiceType;
        }

        if (voiceType) {
          if (voiceType == "all") {
            return true;
          }

          return item.type === voiceType;
        }
      });

    return voicesList;
  });
};

// listVoicesApi({
//   apiKey: minimaxApiKey,
//   lang: "zh",
//   voiceType: voiceTypes.voice_cloning,
// }).then((resp) => {
//   console.log("RESP", resp);
// });

module.exports = {
  listMinimaxVoicesApi,
};
