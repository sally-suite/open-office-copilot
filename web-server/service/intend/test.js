const fs = require("fs");
const { marked } = require("marked");

function extractJsonDataFromMd(inputText) {
  try {
    let jsonText = inputText;
    const result = JSON.parse(jsonText);
    return result;
  } catch (err) {
    const renderer = new marked.Renderer();
    const codeBlocks = [];
    //@ts-ignore
    renderer.code = (code, infostring, escaped) => {
      codeBlocks.push({ code, infostring });
      return "";
    };
    marked(inputText, { renderer });

    let jsonData;
    if (codeBlocks.length > 0) {
      jsonData = codeBlocks[0].code.text;
    } else {
      const regex = /```(?:json)?\s*([\s\S]+?)\s*```/;
      const match = regex.exec(inputText);
      if (match && match[1]) {
        jsonData = match[1];
      }
    }
    console.log(jsonData);
    try {
      const jsonObject = JSON.parse(jsonData);
      return jsonObject;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return {};
    }
  }
}

const content =
  '{"function_code":"=ARRAYFORMULA(IF(E2:E<>\\"\\",\\"n\\",))","explain":"This function will change the unit in the \'Unit\' column to \'n\'. It uses the ARRAYFORMULA function to apply the transformation to the entire column at once."}'; // fs.readFileSync("./test.txt", "utf8");

const jsonData = extractJsonDataFromMd(content);

console.log(jsonData);
