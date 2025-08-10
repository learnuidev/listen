const { youtube } = require("./youtube");

async function getVideoByIdApi({ videoId }) {
  const response = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoId,
  });

  if (response.data.items.length > 0) {
    const video = response.data.items[0];

    return {
      videoId: video.id,
      title: video?.snippet?.title,
      description: video?.snippet?.description,
      author: video?.snippet?.channelTitle,
      thumbnails: video?.snippet?.thumbnails,
    };
  } else {
    throw Error("No video found with that ID.");
  }
}

module.exports = {
  getVideoByIdApi,
};

// let sampleVideoId = "w9cngtAe7XY";

// getVideoByIdApi({ videoId: sampleVideoId }).then((video) => {
//   console.log("VIDEO", video);
// });

// eslint-disable-next-line no-unused-vars
// const sampleResponse = {
//   videoId: "w9cngtAe7XY",
//   title: "非洲人翻唱【一剪梅】Xue Hua Piao Piao 太好听了",
//   description:
//     "大家好！我们来自非洲卢旺达，感谢大家对我们的支持，我们会继续努力!\n" +
//     "\n" +
//     "视频介绍·：非洲帅哥波波 \n" +
//     "伴奏制作：Aobeats & Tylor\n" +
//     "\n" +
//     "帅哥波波团队的 IG/FB： \n" +
//     "Instagram: https://www.instagram.com/feizhoubobo/\n" +
//     "Facebook Page: https://web.facebook.com/Feizhou-Bobo-100460479597149\n" +
//     "\n" +
//     " ------------------------------------------------- \n" +
//     "原唱：費玉清 https://youtu.be/AjitR7RZEQU",
//   author: "卢旺达青年团",
//   thumbnails: {
//     default: {
//       url: "https://i.ytimg.com/vi/w9cngtAe7XY/default.jpg",
//       width: 120,
//       height: 90,
//     },
//     medium: {
//       url: "https://i.ytimg.com/vi/w9cngtAe7XY/mqdefault.jpg",
//       width: 320,
//       height: 180,
//     },
//     high: {
//       url: "https://i.ytimg.com/vi/w9cngtAe7XY/hqdefault.jpg",
//       width: 480,
//       height: 360,
//     },
//     standard: {
//       url: "https://i.ytimg.com/vi/w9cngtAe7XY/sddefault.jpg",
//       width: 640,
//       height: 480,
//     },
//     maxres: {
//       url: "https://i.ytimg.com/vi/w9cngtAe7XY/maxresdefault.jpg",
//       width: 1280,
//       height: 720,
//     },
//   },
// };
