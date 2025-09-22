const {
  mandarinoQwen,
  mandarinoFal,
} = require("../../lib/mandarino/mandarino-client");

const generateBookCoverPhotoApi = async ({
  title,
  context,
  author,
  variant = "pro",
}) => {
  let prompt = `
  Please generate a high quality book cover photo for the book titled: ${title}. 
  Please make the book cover highly professional and very nice looking.
  Avoid generating any kind of text. Also keep the photo PG`;

  const defaultModel = "wan2.2-t2i-plus";

  const model = variant === "flash" ? "wan2.2-t2i-flash" : defaultModel;
  if (author) {
    prompt = prompt + ` Written by ${author}.`;
  }

  if (context) {
    prompt =
      prompt +
      `

    ===
    Here is the additional context about the book: ${JSON.stringify(context)}

    `;
  }

  console.log(`Final prompt`, prompt);

  try {
    const imageUrl = await mandarinoQwen.textToImage({ text: prompt, model });

    return imageUrl;
  } catch (err) {
    const imageUrl = await mandarinoFal.textToImage({ text: prompt });

    return imageUrl;
  }
};

module.exports = {
  generateBookCoverPhotoApi,
};

// generateBookCoverPhotoApi({
//   title: "毛泽东的故事",
//   //   author: "JK Rowling",
//   variant: "pro",
//   context:
//     "Generate photo of Chairman Mao with Zhao Enlai and interacting with peasants",
// }).then((resp) => {
//   console.log("RESP", resp);
// });
