/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

// 帮我写一段Nodejs函数，可以把csv  文件转换成json文件，不要引用其他的库

const fs = require('fs');

function csvToJson(csvFilePath, jsonFilePath) {
  // Read the CSV file
  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  // Split the CSV data into rows
  const rows = csvData.split('\n');

  // Get the header row
  //   const headers = rows[0].split(',').map((header) => JSON.parse(header.trim()));
  // Initialize an array to store the JSON objects
  const jsonData = [];

  // Process each row starting from the second row (index 1)
  for (let i = 1; i < rows.length; i++) {
    const splitIndex = rows[i].indexOf(',');
    const act = rows[i].substring(0, splitIndex + 1);
    const prompt = rows[i].substring(splitIndex + 1);
    if (!act || !prompt) {
      continue;
    }
    let propm = prompt.substring(0, prompt.length - 1);
    propm = propm.replace(/^"|"$/g, '');
    const jsonObj = {
      act: act.substring(0, act.length - 1),
      prompt: propm,
    };
    // Add the JSON object to the array
    jsonData.push(jsonObj);
  }

  // Convert the array of JSON objects to a JSON string
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Write the JSON string to the output file
  fs.writeFileSync(jsonFilePath, jsonString, 'utf8');

  console.log('Conversion complete. JSON file created:', jsonFilePath);
}

// Example usage:
csvToJson('./zh.csv', 'zh.json');
