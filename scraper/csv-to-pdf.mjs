import { chromium } from 'playwright';
import fs from 'fs';

const base = 'C:/Users/user/Desktop/duna-bot/corpus/04-законы-империи';
const out = 'C:/Users/user/Desktop/duna-rules/04-законы-империи';

const sheets = [
  { file: 'приложение-1-статусы.csv', title: 'Приложение 1: Статусы Фафрелах', pdf: 'приложение-1-статусы-фафрелах.pdf' },
  { file: 'приложение-2-обязанности.csv', title: 'Приложение 2: Обязанности по Фафрелаху', pdf: 'приложение-2-обязанности-фафрелах.pdf' },
  { file: 'приложение-3-права.csv', title: 'Приложение 3: Права по Фафрелаху', pdf: 'приложение-3-права-фафрелах.pdf' },
];

const browser = await chromium.launch({ headless: true });

for (const sheet of sheets) {
  const csv = fs.readFileSync(`${base}/${sheet.file}`, 'utf-8');
  const lines = csv.split('\n');
  
  // Build HTML table
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; line-height: 1.3; margin: 16px; color: #1a1a1a; }
  h1 { font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #c9a96e; padding-bottom: 6px; }
  table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  td { border: 1px solid #ccc; padding: 3px 4px; vertical-align: top; font-size: 8px; }
  tr:first-child td { background: #f0e6d3; font-weight: bold; }
</style></head><body>
<h1>${sheet.title}</h1>
<table>`;

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(',');
    html += '<tr>';
    for (const cell of cells) {
      const clean = cell.replace(/"/g, '').trim();
      html += `<td>${clean || '&nbsp;'}</td>`;
    }
    html += '</tr>';
  }
  html += '</table></body></html>';

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: `${out}/${sheet.pdf}`, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '8mm', right: '8mm' }, printBackground: true });
  await page.close();
  console.log(`✔ ${sheet.pdf}`);
}

await browser.close();
console.log('Done: 3 приложения → PDF');
