// const { listTranscript } = require("mandarino");

const listTranscriptByIdHandler = async (event) => {
  try {
    const { videoId, lang } = JSON.parse(event.body);

    if (!videoId) {
      throw Error("Video Id not provided");
    }
    if (!lang) {
      throw Error("Lang not provided");
    }

    // let transcript = await listTranscript({ videoId, lang });
    let transcript = [];

    const response = {
      statusCode: 200,
      body: JSON.stringify(transcript),
    };

    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
};

module.exports = {
  listTranscriptByIdHandler,
};
