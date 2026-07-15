import fs from 'fs';
const html = fs.readFileSync('C:/Users/user/Desktop/duna-app/index.html', 'utf-8');

console.log('Size:', (html.length/1024).toFixed(0), 'KB');
console.log('DOCTYPE:', html.startsWith('<!DOCTYPE'));
console.log('Ends with </html>:', html.trimEnd().endsWith('</html>'));

// Check script blocks
const openScripts = (html.match(/<script/g) || []).length;
const closeScripts = (html.match(/<\/script>/g) || []).length;
console.log('Script blocks:', openScripts, 'open,', closeScripts, 'close');

// Check manifest base64
const idx = html.indexOf('data:application/json;base64,');
if (idx > 0) {
  const end = html.indexOf('"', idx + 29);
  const b64 = html.substring(idx + 29, end);
  try {
    const dec = Buffer.from(b64, 'base64').toString('utf-8');
    JSON.parse(dec);
    console.log('Manifest: valid JSON,', b64.length, 'chars base64');
  } catch(e) { console.log('Manifest ERROR:', e.message); }
}

// Check documents
const docIdx = html.indexOf('const DOCUMENTS');
console.log('Documents array:', docIdx > 0 ? 'YES at pos ' + docIdx : 'NO');

// Check for syntax errors in JS - look for problematic patterns
const jsErrors = [];
if (html.includes('};</script>')) jsErrors.push('semicolon before closing script');
if (html.includes('``')) jsErrors.push('template literals');
if (jsErrors.length) console.log('Potential JS issues:', jsErrors.join(', '));
else console.log('No obvious JS syntax issues');
