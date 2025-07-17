const OpenAI = require("openai");

// const { isChinese } = require("./libs/chinese-converter");

const { mandarinoClient } = require("./mandarino-client");
const { openAiApiKey } = require("../../constants/api-keys");
const { translateTo } = require("../google/translate-to");
const { removeNull } = require("../../utils/remove-null");
const { isChinese } = require("mandarino");

const openai = new OpenAI({
  apiKey: openAiApiKey,
});

// =========== part 1
// step 1: Create Sentence Function
async function gen_pinyin(sentence) {
  const pinyin = await mandarinoClient.genPinyin({ content: sentence });

  return pinyin;
}
async function gen_roman(sentence) {
  const roman = await mandarinoClient.genRoman({ content: sentence });

  return roman;
}

async function gen_lit(sentence) {
  const systemContent = `
    You are a Simple Chinese Expert.
    Please provide literal english translation for the following sentence`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemContent,
      },

      { role: "user", content: `sentence: ${sentence}` },
    ],
    model: "gpt-4o-mini",
  });

  const resp = await chatCompletion?.choices?.[0]?.message?.content;

  //   const tutorials = JSON.parse(resp);
  return resp;

  // return tutorials
  // 1. Add id to the tutorial + add
  //   return tutorials?.map((tutorial) => {
  //     return {
  //       ...tutorial,
  //       id: chance.guid(),
  //       user_id,
  //       component: component,
  //       hsk_level,
  //       // en: tutorial?.sentence,
  //     };
  //   });
}

// =========== part 2
async function generateTranslations(sentences) {
  return Promise.all(
    sentences.map(async (sentence) => {
      const item = sentence?.input || sentence?.hanzi;

      const isChineseItem = isChinese(item);

      let roman;
      let pinyin;

      try {
        pinyin = sentence?.pinyin || (await gen_pinyin(item));
        roman = sentence?.roman || (await gen_roman(item));
      } catch (err) {
        pinyin = "";
        roman = "";
      }
      // const roman =
      //   sentence?.pinyin || sentence?.roman || isChineseItem
      //     ? await gen_pinyin(item)
      //     : // ? pinyin(item)
      //       await gen_pinyin(item);

      // const en = sentence?.en || (await gen_en(item));

      let en;
      try {
        en = (
          sentence?.en || (await translateTo({ text: item, targetLang: "en" }))
        )
          ?.replaceAll(/&quot;/g, '"')
          ?.replaceAll(/&#39;/g, "'");
      } catch (err) {
        console.log("ERR", err);
        en = "";
      }
      // const hanzi = isChinese(item) ? null : await gen_hanzi(item);
      let hanzi;
      try {
        hanzi = isChineseItem
          ? null
          : await translateTo({ text: item, targetLang: "zh-CN" });
      } catch (err) {
        hanzi = "";
      }

      // const context = isChineseItem ? await parseYabla(item) : null;
      const updatedAt = Date.now();
      return removeNull({
        ...sentence,
        updatedAt,
        hanzi,
        // context,
        en,
        roman,
        pinyin,
      });
    })
  );
}

module.exports.generateTranslations = generateTranslations;
