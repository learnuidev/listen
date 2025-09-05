const { updateYoutubeVideos } = require("../08/30-1-21-update-youtube-info");

const contentIds = [
  "5c64014a-89f4-5524-8d04-e27c83d4e2ba",
  "89dfbd0a-75aa-50fe-ad0f-d4633d604e8c",
  "3797be0c-ed0c-5e83-a7af-d8bf5c1751a8",
  "b2565c5a-0019-56d2-8217-00cbdd9c299d",
  "f15d7976-0319-5689-a548-47fc542f8712",

  "41b062b0-23a0-5ab5-b009-a0e1da67c62d",
  "b2565c5a-0019-56d2-8217-00cbdd9c299d",
  "815ae171-f286-55ea-a05e-d00692ad9b8d",
  "58264992-b505-52ea-8b3d-d5bb06d3ed2e",
  "f15d7976-0319-5689-a548-47fc542f8712",
  "fadc90e2-9142-5c5b-9089-ab0f464ab37e",
  "c793e947-fae9-53dc-80cd-7925e6bbd36c",
  "2ec9af8b-a2eb-5780-9151-093d8ca256f7",
  "0d2f8d22-747e-5290-9be0-b8890e4bf61b",
  "8062ca09-246c-5063-b113-17e134a66209",
];

updateYoutubeVideos(contentIds).then(() => {
  console.log("done");
});
