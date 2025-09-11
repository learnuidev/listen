const { minimaxApi } = require("./minimax-api");

const listSystemVoices = async ({ lang }) => {
  const voices = await minimaxApi.listSystemVoices({ lang });

  return voices;
};

// listSystemVoices({
//   lang: "zh",
// }).then((res) => {
//   console.log("res", res);
// });

module.exports = {
  listSystemVoices,
};
