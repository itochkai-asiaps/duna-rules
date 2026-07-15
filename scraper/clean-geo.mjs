import fs from 'fs';

let text = fs.readFileSync('C:/Users/user/Desktop/geo-raw.txt', 'utf-8');

// Merge words split across lines (with empty lines between)
const lines = text.split('\n');
const merged = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) {
    if (merged.length && merged[merged.length - 1] !== '') merged.push('');
    continue;
  }
  // If previous "line" was a single short word and this is also short, merge
  if (merged.length > 0 && merged[merged.length - 1] !== '' 
      && merged[merged.length - 1].length < 30 && !merged[merged.length - 1].endsWith('.')
      && !merged[merged.length - 1].endsWith(':') && !merged[merged.length - 1].endsWith('?')
      && !merged[merged.length - 1].endsWith('!')) {
    merged[merged.length - 1] += ' ' + line;
  } else {
    merged.push(line);
  }
}

text = merged.join('\n');
text = text.replace(/\n{3,}/g, '\n\n');

const outPath = 'C:/Users/user/Desktop/duna-bot/corpus/03-материалы';
fs.mkdirSync(outPath, { recursive: true });
fs.writeFileSync(outPath + '/географические-открытия.txt', text);
console.log('Done: ' + text.length + ' chars, ' + text.split('\n').length + ' lines');
