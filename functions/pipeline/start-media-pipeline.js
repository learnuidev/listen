module.exports.handler = async (event) => {
  const { mediaFileId, type, mediaId, userId } = event;

  // start pipeline
  if (type === "human-audio") {
    // trigger human audio pipeline
    return { mediaFileId, type, mediaId, userId };
  }

  if (type === "text-only") {
    // trigger text only pipeline
    return { mediaFileId, type, mediaId, userId };
  }
};
