const { getVideoByIdApi } = require("./get-video-by-id.api");

const getVideoByIdHandler = async (event) => {
  try {
    const { videoId } = JSON.parse(event.body);

    if (!videoId) {
      throw Error("Video Id not provided");
    }

    let youtubeVideo = await getVideoByIdApi({ videoId });

    const response = {
      statusCode: 200,
      body: JSON.stringify(youtubeVideo),
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
  getVideoByIdHandler,
};
