const apiKey =
  "mando-vCRJB0c0ksBbuwG8JeFuQ+zL4ThjWWtbffgNzqaGjaA=1173e0af34735e829968547724141beb087bdfcbc13699e5c5bdf8ea47ec33d7";

const contentId = `55bc9340-f9de-5666-bab8-b2f3f6de5432`;

const before = Date.now();
const res = await fetch(
  // `https://n428znwey5.execute-api.us-east-1.amazonaws.com/dev/v1/list-components`,
  // `https://n428znwey5.execute-api.us-east-1.amazonaws.com/dev/v1/list-characters`,
  `https://n428znwey5.execute-api.us-east-1.amazonaws.com/dev/v1/get-content`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      contentId,
    }),
  }
);

if (!res.ok) {
  console.log("ERROR", res.statusText);
  console.log(res.status);
} else {
  const resp = await res.json();

  //   console.log("FETCH SUCCESS", resp?.length);
  console.log("FETCH SUCCESS", resp);

  const after = Date.now();
  console.log("Latency", after - before);
}
