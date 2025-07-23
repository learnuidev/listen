const { ElevenLabsClient } = require("elevenlabs");

const { elevenLabsApiKey } = require("../../constants/api-keys");

const elevenlabs = new ElevenLabsClient({
  apiKey: elevenLabsApiKey,
});

const elevenLabsSpeechToText = async ({ audioUrl }) => {
  const response = await fetch(audioUrl);
  const audioBlob = new Blob([await response.arrayBuffer()], {
    type: "audio/mp3",
  });

  const transcription = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported.
    tagAudioEvents: true, // Tag audio events like laughter, applause, etc.
    languageCode: "eng", // Language of the audio file. If set to null, the model will detect the language automatically.
    diarize: true, // Whether to annotate who is speaking
    model_id: "scribe_v1",
  });

  return {
    ...transcription,

    words: transcription.words.map((word, idx, ctx) => {
      const start = ctx
        ?.slice(0, idx)
        ?.reduce((acc, curr) => acc + curr?.text?.length, 0);

      const end = start + word?.text?.length;

      return {
        speakerId: word?.speaker_id,
        start: idx == 0 ? 0 : start,
        end: idx === 0 ? word?.text?.length : end,
        startTime: word?.start * 1000,
        endTime: word?.end * 1000,
        type: word?.type,
        value: word?.text,
      };
    }),
  };
};

// elevenLabsSpeechToText({
//   audioUrl: "",
// }).then((resp) => {
//   console.log("resp", resp);
// });

module.exports = {
  elevenLabsSpeechToText,
};
