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

elevenLabsSpeechToText({
  lastUpdated: 1753234698441,
  id: "Aunque tarde o temprano termine#es",
  voice: "abril",
  s3Key: "01K0TEWRAGXK8GAFHX8KR70H1A.mp3",
  audioUrl:
    "https://nomadmethod-api-dev-assetsbucket-2u2iqsv5nizc.s3-accelerate.amazonaws.com/01K0TEWRAGXK8GAFHX8KR70H1A.mp3?AWSAccessKeyId=ASIA3EL4T6TB45IB5XM2&Expires=1753321618&Signature=kucNFEt2iCLvkivka1oW4Xfx2Ic%3D&X-Amzn-Trace-Id=Root%3D1-68803f10-71e299ff184cf8ee27e0c6af%3BParent%3D0b182be4ae8a4bd1%3BSampled%3D0&x-amz-security-token=IQoJb3JpZ2luX2VjEOL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIBBjO42%2BM9bwZlw%2BdysETTrcXscYSZqCAldqTWnU2FFnAiEA9O25ah%2F9D%2BUH3kO10Dh77TMLFeL42GHF3u0sA0dlaJoqjQMI%2B%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw3NjUzMDI0MDQyOTEiDMjWWpNgTKm7Opb0JSrhAosbU2CYeLldkV7vgMzJadv60tpm2V%2BirkvC2uuE%2Bg4r5DBMlVp8ujxYZBeWA1qgGDCLI1MxFYi91IM3iEF9nKP2%2FWDxt5RvkktB%2BXs2Yamc9I0Oxv8ZazxXbIS%2BEJfT9qP3ZpsrqoW9UkNcnYpNevUrYI6Ku6%2F8ZoP88Kg6lKi6778Rg0bAyFK3QadMIUw6V4QxpjrtKNZF%2FV5MJeEHM7CaEXAr9HcaixBFw0cq90HE%2BzyHzWs7dxEr0EFJ5f1qliIl98cklvhnJe555%2B6jxoMhCVp1cCmaeUXZrIM1%2BYRvB9Pcqp2vdpqjivzwkCo82OX4Szgxx63XQ4t50kjIuIE8MMoWnyhfwD6529UrrSjshVxfbX6UfSYPt4nILTf2s2djLsKWLfaAX6FwjnYImdBJlBk%2BHHE93OWafNX6aDKHxgd4aRZ2ir831sLyj9DKbNrS%2Bgai4aZDWgqfLllREbdcMJD%2BgMQGOp4BXUcEIfPn%2FYiMzkUkpuUMAFFd%2Fs30lgHrKjSIsGsBjl%2F%2FkWOcloRUoPlWtaTGIUieYMMA17tO22BI5ULaZrhJoqmmU%2Byk%2FFmXjMg7OMuN2wC4ib7leVN%2FksOveAL2iNcr%2Fl7xYp7s%2BYXuZuu423sNSku4gyX%2F26NqvNnZzftyELITdo0gWr3oitFtlLmA%2F5veNS5xBF42hXQoHkN4GOM%3D",
}).then((resp) => {
  console.log("resp", resp);
});

module.exports = {
  elevenLabsSpeechToText,
};
