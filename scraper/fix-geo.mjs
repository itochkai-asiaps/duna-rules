import fs from 'fs';

let text = fs.readFileSync('C:/Users/user/Desktop/geo-raw.txt', 'utf-8');

// Split on double-empty-lines = paragraph boundaries
const blocks = text.split(/\n\s*\n\s*\n/);

const processed = blocks.map(block => {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length <= 1) return lines.join('');
  let result = lines.join(' ');
  result = result.replace(/\s+([.,!?:;»)%])/g, '$1');
  result = result.replace(/([«(])\s+/g, '$1');
  return result;
});

text = processed.join('\n\n').trim();

const outDir = 'C:/Users/user/Desktop/duna-bot/corpus/03-материалы';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + '/географические-открытия.txt', text);
console.log('Done:', text.length, 'chars');
console.log(text.substring(0, 800));
