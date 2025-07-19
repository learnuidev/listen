const { GoogleGenerativeAI } = require("@google/generative-ai");
const mime = require("mime-types");

const { geminiApiKey } = require("../../constants/api-keys");
const { parseInput } = require("mandarino/src/utils/parse-input");

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Create a model instance
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const prompt = `
Extract word by word text from this audio. Please include start and end timestamps (seconds) as well as start and end index.

For reference please use the orignal_text_context as the source of truth

Format the output as a stringified JSON format like so:
[{
"text": "...",
"startIndex": "...",
"endIndex": "...",
"start": "0",
"end": "2"
}]
`;

const speechToText = ({ audioUrl, text }) => {
  return fetch(audioUrl).then(async (response) => {
    const arrayBuffer = await response.arrayBuffer();

    const audioMetadata = {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString("base64"),
        mimeType: mime.lookup("result.mp3"),
      },
    };

    return model
      .generateContent(
        [`${prompt} original_text_context: ${text}`, audioMetadata],
        {}
      )
      .then(async (resp) => {
        console.log("resp", resp);
        const text = await resp?.response?.text();

        const parsed = parseInput(text);

        console.log("RESP", JSON.stringify({ ...resp, parsed }, null, 4));

        return parsed;
        // const parsed = {};
      });
  });
};

module.exports = {
  speechToText,
};

const resp = {
  response: {
    candidates: [
      {
        content: {
          parts: [
            {
              text: '```json\n[\n    {\n        "hanzi": "忙碌的一天",\n        "pinyin": "máng lù de yì tiān",\n        "start": "0.243",\n        "end": "1.323"\n    },\n  {\n        "hanzi": "我去理发店，我剪头发。",\n        "pinyin": "wǒ qù lǐ fà diàn, wǒ jiǎn tóu fà.",\n        "start": "2.563",\n        "end": "5.693"\n    },\n    {\n        "hanzi": "我去邮局，我寄信。",\n        "pinyin": "wǒ qù yóu jú, wǒ jì xìn.",\n         "start": "8.253",\n        "end": "12.103"\n    },\n  {\n        "hanzi": "我去消防站，我学习安全守则。",\n        "pinyin": "wǒ qù xiāo fáng zhàn, wǒ xué xí ān quán shǒu zé.",\n        "start": "13.373",\n        "end":"18.603"\n    },\n  {\n        "hanzi": "我去图书馆，",\n        "pinyin": "wǒ qù tú shū guǎn,",\n         "start": "21.093",\n        "end": "23.373"\n    },\n  {\n        "hanzi":"我借书。",\n        "pinyin":"wǒ jiè shū.",\n        "start":"24.083",\n        "end":"25.873"\n  },\n {\n        "hanzi": "我去面包店，我买面包。",\n        "pinyin":"wǒ qù miàn bāo diàn, wǒ mǎi miàn bāo.",\n        "start":"26.963",\n        "end":"31.883"\n    },\n  {\n        "hanzi":"我去超市，我买吃的东西。",\n        "pinyin":"wǒ qù chāo shì, wǒ mǎi chī de dōng xi.",\n        "start":"33.173",\n        "end":"37.353"\n    },\n{\n        "hanzi": "我去宠物店，我买狗粮。",\n        "pinyin":"wǒ qù chǒng wù diàn, wǒ mǎi gǒu liáng.",\n        "start":"38.973",\n        "end":"44.373"\n  },\n   {\n        "hanzi": "哇，忙碌的一天。",\n        "pinyin":"wa, máng lù de yì tiān.",\n         "start":"45.653",\n        "end":"48.703"\n    }\n]\n```',
            },
          ],
          role: "model",
        },
        finishReason: "STOP",
        safetyRatings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            probability: "NEGLIGIBLE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            probability: "NEGLIGIBLE",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            probability: "NEGLIGIBLE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            probability: "NEGLIGIBLE",
          },
        ],
        avgLogprobs: -0.24844551367331325,
      },
    ],
    usageMetadata: {
      promptTokenCount: 2586,
      candidatesTokenCount: 679,
      totalTokenCount: 3265,
    },
    modelVersion: "gemini-2.0-flash-exp",
  },
  parsed: [
    {
      hanzi: "忙碌的一天",
      pinyin: "máng lù de yì tiān",
      start: "0.243",
      end: "1.323",
    },
    {
      hanzi: "我去理发店，我剪头发。",
      pinyin: "wǒ qù lǐ fà diàn, wǒ jiǎn tóu fà.",
      start: "2.563",
      end: "5.693",
    },
    {
      hanzi: "我去邮局，我寄信。",
      pinyin: "wǒ qù yóu jú, wǒ jì xìn.",
      start: "8.253",
      end: "12.103",
    },
    {
      hanzi: "我去消防站，我学习安全守则。",
      pinyin: "wǒ qù xiāo fáng zhàn, wǒ xué xí ān quán shǒu zé.",
      start: "13.373",
      end: "18.603",
    },
    {
      hanzi: "我去图书馆，",
      pinyin: "wǒ qù tú shū guǎn,",
      start: "21.093",
      end: "23.373",
    },
    {
      hanzi: "我借书。",
      pinyin: "wǒ jiè shū.",
      start: "24.083",
      end: "25.873",
    },
    {
      hanzi: "我去面包店，我买面包。",
      pinyin: "wǒ qù miàn bāo diàn, wǒ mǎi miàn bāo.",
      start: "26.963",
      end: "31.883",
    },
    {
      hanzi: "我去超市，我买吃的东西。",
      pinyin: "wǒ qù chāo shì, wǒ mǎi chī de dōng xi.",
      start: "33.173",
      end: "37.353",
    },
    {
      hanzi: "我去宠物店，我买狗粮。",
      pinyin: "wǒ qù chǒng wù diàn, wǒ mǎi gǒu liáng.",
      start: "38.973",
      end: "44.373",
    },
    {
      hanzi: "哇，忙碌的一天。",
      pinyin: "wa, máng lù de yì tiān.",
      start: "45.653",
      end: "48.703",
    },
  ],
};
