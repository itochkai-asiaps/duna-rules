import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Resolve config path relative to this script ───────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');

// ─── HTML Template ─────────────────────────────────────────────────────────
function buildHtml(title, bodyText) {
  const paragraphs = bodyText
    .split('\n\n')
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const escaped = block
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<p>${escaped.replace(/\n/g, '<br>\n')}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      line-height: 1.8;
      max-width: 780px;
      margin: 32px auto;
      padding: 0 28px 48px;
      color: #1a1a1a;
    }
    h1 { font-size: 22px; margin: 0 0 24px 0; font-weight: 700; }
    p { margin: 0 0 14px 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${paragraphs}
</body>
</html>`;
}

// ─── Content Extraction ────────────────────────────────────────────────────
async function extractContent(page) {
  return page.evaluate(() => {
    const blocks = document.querySelectorAll('#allrecords .r.t-rec');
    const texts = [];
    blocks.forEach(b => {
      if (b.querySelector('.t228')) return;
      const text = b.innerText.trim();
      if (!text) return;
      if (text.includes('@МГ') || text.includes('Искать по сайту') || text === 'Наверх' || text === 'Дюна 2026') return;
      texts.push(text);
    });
    return texts.join('\n\n');
  });
}

// ─── Ensure directories exist ──────────────────────────────────────────────
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ─── Ensure directories for all folders ────────────────────────────────────
function ensureAllDirectories(config) {
  const folders = new Set();
  for (const p of config.pages) {
    folders.add(p.folder);
  }
  for (const d of config.googleDocs) {
    folders.add(d.folder);
  }
  for (const folder of folders) {
    ensureDir(join(config.outputDir, folder));
    ensureDir(join(config.corpusDir, folder));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 1 — Scrape website pages
// ═══════════════════════════════════════════════════════════════════════════
async function scrapePages(browser, config, corpusFiles) {
  const { chromium } = await import('playwright');
  const TOTAL = config.pages.length;

  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let completed = 0;
  let failed = 0;

  for (const entry of config.pages) {
    const url = `${config.baseUrl}${entry.path}`;
    const pdfPath = join(config.outputDir, entry.folder, `${entry.file}.pdf`);
    const txtPath = join(config.corpusDir, entry.folder, `${entry.file}.txt`);
    completed++;

    try {
      console.log(`[${completed}/${TOTAL}] ${entry.title}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);

      const content = await extractContent(page);

      if (!content || content.length < 30) {
        console.warn(`         ⚠ мало контента (${content ? content.length : 0} символов) — продолжаем`);
      }

      // Save .txt for bot corpus
      ensureDir(dirname(txtPath));
      writeFileSync(txtPath, content, 'utf-8');

      // Save .pdf for human reading
      ensureDir(dirname(pdfPath));
      const html = buildHtml(entry.title, content);
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 15000 });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
        printBackground: false,
        displayHeaderFooter: false,
      });

      corpusFiles.push({
        folder: entry.folder,
        file: `${entry.file}.txt`,
        title: entry.title,
        source: 'website',
        sourceUrl: url,
        charCount: content.length,
      });

      console.log(`         ✔ PDF + TXT (${content.length} символов)`);
    } catch (err) {
      failed++;
      console.error(`         ✘ ОШИБКА: ${err.message}`);
      corpusFiles.push({
        folder: entry.folder,
        file: `${entry.file}.txt`,
        title: entry.title,
        source: 'website',
        sourceUrl: url,
        charCount: 0,
        error: err.message,
      });
    }

    await page.waitForTimeout(500);
  }

  await context.close();
  return { completed, failed };
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 2 — Fetch Google Docs
// ═══════════════════════════════════════════════════════════════════════════
async function fetchGoogleDocs(config, corpusFiles) {
  const TOTAL = config.googleDocs.length;
  let completed = 0;
  let failed = 0;

  for (const doc of config.googleDocs) {
    const exportUrl = `https://docs.google.com/document/d/${doc.id}/export?format=txt`;
    const pdfPath = join(config.outputDir, doc.folder, `${doc.file}.pdf`);
    const txtPath = join(config.corpusDir, doc.folder, `${doc.file}.txt`);
    completed++;

    try {
      console.log(`[DOC ${completed}/${TOTAL}] ${doc.title} (Google Docs)`);

      const response = await fetch(exportUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();

      if (!content || content.trim().length < 20) {
        console.warn(`         ⚠ мало контента (${content.trim().length} символов)`);
      }

      // Save .txt for bot corpus
      ensureDir(dirname(txtPath));
      writeFileSync(txtPath, content, 'utf-8');

      // Build HTML and save as PDF using Playwright
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      const html = buildHtml(doc.title, content);
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 15000 });

      ensureDir(dirname(pdfPath));
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
        printBackground: false,
        displayHeaderFooter: false,
      });

      await browser.close();

      corpusFiles.push({
        folder: doc.folder,
        file: `${doc.file}.txt`,
        title: doc.title,
        source: 'google-doc',
        sourceUrl: `https://docs.google.com/document/d/${doc.id}`,
        charCount: content.trim().length,
        note: doc.note || '',
      });

      console.log(`         ✔ PDF + TXT (${content.trim().length} символов)`);
    } catch (err) {
      failed++;
      console.error(`         ✘ ОШИБКА: ${err.message}`);
      corpusFiles.push({
        folder: doc.folder,
        file: `${doc.file}.txt`,
        title: doc.title,
        source: 'google-doc',
        sourceUrl: `https://docs.google.com/document/d/${doc.id}`,
        charCount: 0,
        error: err.message,
        note: doc.note || '',
      });
    }

    // Polite delay between Google Doc requests
    await new Promise(r => setTimeout(r, 1000));
  }

  return { completed, failed };
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 3 — Build manifest.json
// ═══════════════════════════════════════════════════════════════════════════
function buildManifest(config, corpusFiles) {
  const manifestPath = join(config.corpusDir, 'manifest.json');

  // Group files by folder
  const byFolder = {};
  for (const f of corpusFiles) {
    if (!byFolder[f.folder]) {
      byFolder[f.folder] = [];
    }
    byFolder[f.folder].push(f);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    totalFiles: corpusFiles.length,
    totalChars: corpusFiles.reduce((sum, f) => sum + (f.charCount || 0), 0),
    files: corpusFiles,
    folders: Object.keys(byFolder).sort().map(folder => ({
      folder,
      fileCount: byFolder[folder].length,
      totalChars: byFolder[folder].reduce((sum, f) => sum + (f.charCount || 0), 0),
    })),
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n[MANIFEST] ${manifestPath}`);
  console.log(`           ${manifest.totalFiles} файлов, ${manifest.totalChars.toLocaleString('ru-RU')} символов`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  // ── Load config ──────────────────────────────────────────────────────────
  if (!existsSync(CONFIG_PATH)) {
    console.error(`[FATAL] config.json not found at: ${CONFIG_PATH}`);
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));

  // Validate required fields
  if (!config.baseUrl || !config.outputDir || !config.corpusDir || !config.pages) {
    console.error('[FATAL] config.json missing required fields: baseUrl, outputDir, corpusDir, pages');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════');
  console.log('  Duna 2026 — Rules Update Pipeline');
  console.log(`  Source: ${config.baseUrl}`);
  console.log(`  Output: ${config.outputDir}`);
  console.log(`  Corpus: ${config.corpusDir}`);
  console.log(`  Pages:  ${config.pages.length}`);
  console.log(`  Docs:   ${config.googleDocs.length}`);
  console.log('═══════════════════════════════════════════════\n');

  // ── Create directories ───────────────────────────────────────────────────
  ensureAllDirectories(config);

  // ── Track all corpus files for manifest ──────────────────────────────────
  const corpusFiles = [];

  // ── Phase 1: Scrape website ──────────────────────────────────────────────
  console.log('── Фаза 1: Сканирование сайта ──');
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  let scrapeResult;
  try {
    scrapeResult = await scrapePages(browser, config, corpusFiles);
  } finally {
    await browser.close();
  }

  // ── Phase 2: Fetch Google Docs ───────────────────────────────────────────
  console.log('\n── Фаза 2: Загрузка Google Docs ──');
  const docsResult = await fetchGoogleDocs(config, corpusFiles);

  // ── Phase 3: Build manifest ──────────────────────────────────────────────
  console.log('\n── Фаза 3: Манифест ──');
  buildManifest(config, corpusFiles);

  // ── Summary ──────────────────────────────────────────────────────────────
  const totalDone = (scrapeResult.completed - scrapeResult.failed) + (docsResult.completed - docsResult.failed);
  const totalFailed = scrapeResult.failed + docsResult.failed;
  const totalTotal = scrapeResult.completed + docsResult.completed;

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  ГОТОВО: ${totalDone}/${totalTotal} файлов обработано`);
  console.log(`  Сайт:   ${scrapeResult.completed - scrapeResult.failed}/${scrapeResult.completed} страниц`);
  console.log(`  Доки:   ${docsResult.completed - docsResult.failed}/${docsResult.completed} документов`);
  if (totalFailed > 0) {
    console.log(`  ОШИБОК: ${totalFailed}`);
    for (const f of corpusFiles.filter(x => x.error)) {
      console.log(`    - ${f.folder}/${f.file}: ${f.error}`);
    }
  }
  console.log(`  PDF:    ${config.outputDir}`);
  console.log(`  Корпус: ${config.corpusDir}`);
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n[FATAL] Pipeline crashed:', err.message);
  process.exit(1);
});
