const baseFontSize = 14;
import fs from 'fs';

function main() {
  const fileContent = fs.readFileSync('./markdown.em.less', 'utf8');

  const updatedContent = fileContent.replace(
    /(\d*\.?\d+)r?em/g,
    (match, value) => {
      const pxValue = parseFloat(value) * baseFontSize;
      return `${pxValue.toFixed(1)}px`;
    }
  );
  fs.writeFileSync('./markdown.less', updatedContent, 'utf8');
}
main();
