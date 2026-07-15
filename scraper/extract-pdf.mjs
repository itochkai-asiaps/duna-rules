import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import fs from 'fs';

const filePath = process.argv[2];
const dataBuffer = fs.readFileSync(filePath);
const parser = new PDFParse(dataBuffer);
await parser.load();

const pages = parser.doc.numPages;
let allText = '';
for (let i = 1; i <= pages; i++) {
  const text = await parser.getPageText(i);
  allText += text + '\n';
}

console.log(`Pages: ${pages} | Text: ${allText.length} chars`);
console.log(allText);
