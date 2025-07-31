const { minimaxApiKey } = require("../../constants/api-keys");

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

/**
 * Fetches a list of system voices from the Minimax API.
 *
 * @param {Object} params - Parameters object.
 * @param {string} [params.lang] - Optional language code to filter the voices by language (e.g., "en", "ar").
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of voice objects. Each voice object contains:
 *   - id {string}: The voice identifier.
 *   - name {string}: The human-readable name of the voice.
 *   - createdAt {string}: The creation date of the voice in YYYY-MM-DD format.
 *   - lang {string}: The language code associated with the voice.
 *
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 *
 * @example
 * listSystemVoices({ lang: 'ar' }).then(voices => {
 *   console.log(voices);
 *   // [
 *   //   {
 *   //     id: "Arabic_CalmWoman",
 *   //     name: "Calm Woman",
 *   //     createdAt: "2025-01-01",
 *   //     lang: "ar"
 *   //   },
 *   //   {
 *   //     id: "Arabic_FriendlyGuy",
 *   //     name: "Friendly Guy",
 *   //     createdAt: "2025-01-01",
 *   //     lang: "ar"
 *   //   }
 *   // ]
 * });
 */
const listSystemVoices = ({ lang }) => {
  return fetch(`https://api.minimax.io/v1/get_voice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${minimaxApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice_type: "system",
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const resp = await response.json();

    const voices = resp.system_voice.map((item) => {
      const mainLang = item?.voice_id
        ?.split("_")[0]
        ?.split(" ")[0]
        ?.toLowerCase();
      const lang = langMap?.[mainLang];
      return {
        id: item?.voice_id,
        name: item?.voice_name,
        createdAt: item?.created_time,
        lang,
      };
    });

    if (lang) {
      return voices?.filter((voice) => voice.lang === lang);
    }
    return voices;
  });
};

module.exports = {
  listSystemVoices,
};
