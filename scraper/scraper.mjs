import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = 'https://duna2026.ru';
const OUTPUT_ROOT = join('C:', 'Users', 'user', 'Desktop', 'duna-rules');

const PAGES = [
  // ── Folder 01: Общие правила ──────────────────────────────────────────────
  {
    folder: '01-общие-правила',
    pages: [
      { path: '/datesandpalce',       title: 'Даты игры и полигон',      filename: '01-даты-игры-и-полигон.pdf' },
      { path: '/concept',              title: 'Идея игры',                filename: '02-идея-игры.pdf' },
      { path: '/masters',              title: 'Мастера',                  filename: '03-мастера.pdf' },
      { path: '/donations',            title: 'Взносы',                   filename: '04-взносы.pdf' },
      { path: '/pubs',                 title: 'Кабаки',                   filename: '05-кабаки.pdf' },
      { path: '/guests',               title: 'Гости на игре',            filename: '06-гости-на-игре.pdf' },
      { path: '/children',             title: 'Дети на игре',             filename: '07-дети-на-игре.pdf' },
      { path: '/pets',                 title: 'Домашние животные',        filename: '08-домашние-животные.pdf' },
      { path: '/foto_video',           title: 'Фото и видеографы',        filename: '09-фото-и-видеографы.pdf' },
      { path: '/crossgender',          title: 'Кросспол',                 filename: '10-кросспол.pdf' },
      { path: '/current_technologies', title: 'Современное на игре',      filename: '11-современное-на-игре.pdf' },
    ],
  },
  // ── Folder 02: Модельные правила ──────────────────────────────────────────
  {
    folder: '02-модельные-правила',
    pages: [
      { path: '/fafrelakh',               title: 'Фафрелах',                        filename: '01-фафрелах.pdf' },
      { path: '/economics',                title: 'Экономика',                       filename: '02-экономика.pdf' },
      { path: '/macro',                    title: 'Макроэкономика и политика',       filename: '03-макроэкономика-и-политика.pdf' },
      { path: '/cosmoguild',               title: 'Космическая гильдия',             filename: '04-космическая-гильдия.pdf' },
      { path: '/melange',                  title: 'Пряность',                        filename: '05-пряность.pdf' },
      { path: '/great_desert',             title: 'Глубокая пустыня',                filename: '06-глубокая-пустыня.pdf' },
      { path: '/disticombs_and_water',     title: 'Дистикомбы и вода',               filename: '07-дистикомбы-и-вода.pdf' },
      { path: '/harvester',                title: 'Харвестер',                       filename: '08-харвестер.pdf' },
      { path: '/fight',                    title: 'Боевые взаимодействия',           filename: '09-боевые-взаимодействия.pdf' },
      { path: '/battlegrounds',            title: 'Бэттлграунды',                    filename: '10-бэттлграунды.pdf' },
      { path: '/gadgets',                  title: 'Гаджеты',                         filename: '11-гаджеты.pdf' },
      { path: '/science',                  title: 'Наука',                           filename: '12-наука.pdf' },
      { path: '/medicine',                 title: 'Медицина',                        filename: '13-медицина.pdf' },
      { path: '/genetics',                 title: 'Генетика',                        filename: '14-генетика.pdf' },
      { path: '/urbanplanning',            title: 'Городское строительство',         filename: '15-городское-строительство.pdf' },
      { path: '/costume',                  title: 'Костюм и эстетика',               filename: '16-костюм-и-эстетика.pdf' },
      { path: '/bg',                       title: 'Орден Бене Гессерит',             filename: '17-орден-бене-гессерит.pdf' },
      { path: '/truevision',               title: 'Правдовидение',                   filename: '18-правдовидение.pdf' },
      { path: '/voice',                    title: 'Голос',                           filename: '19-голос.pdf' },
      { path: '/mentats',                  title: 'Ментаты',                         filename: '20-ментаты.pdf' },
      { path: '/tannai',                   title: 'Таннаи',                          filename: '21-таннаи.pdf' },
      { path: '/religion',                 title: 'Религия',                         filename: '22-религия.pdf' },
      { path: '/slavery',                  title: 'О рабстве',                       filename: '23-о-рабстве.pdf' },
      { path: '/sex',                      title: 'Правила по сексу',                filename: '24-правила-по-сексу.pdf' },
      { path: '/death',                    title: 'Смерть и посмертие',              filename: '25-смерть-и-посмертие.pdf' },
      { path: '/other_rules',              title: 'Прочие правила',                  filename: '26-прочие-правила.pdf' },
    ],
  },
  // ── Folder 03: Материалы ───────────────────────────────────────────────────
  {
    folder: '03-материалы',
    pages: [
      { path: '/lore',                  title: 'Источники для подготовки',       filename: '01-источники-для-подготовки.pdf' },
      { path: '/glossary',              title: 'Глоссарий',                      filename: '02-глоссарий.pdf' },
      { path: '/locations',             title: 'Общая структура локаций',        filename: '03-общая-структура-локаций.pdf' },
      { path: '/great_houses',          title: 'Великие дома',                   filename: '04-великие-дома.pdf' },
      { path: '/chronology',            title: 'Хронология',                     filename: '05-хронология.pdf' },
      { path: '/schools',               title: 'Школы и их аналоги',             filename: '06-школы-и-их-аналоги.pdf' },
      { path: '/bg2',                   title: 'О роли Бене Гессерит',           filename: '07-о-роли-бене-гессерит.pdf' },
      { path: '/kaitain_tour',          title: 'Кайтайн',                        filename: '08-кайтайн.pdf' },
      { path: '/religion_to_every_day', title: 'Религия на каждый день',         filename: '09-религия-на-каждый-день.pdf' },
      { path: '/frontiers',             title: 'Рубежи',                         filename: '10-рубежи.pdf' },
    ],
  },
  // ── Folder 04: Законы Империи ──────────────────────────────────────────────
  {
    folder: '04-законы-империи',
    pages: [
      { path: '/great_convention',      title: 'Великая Конвенция',                         filename: '01-великая-конвенция.pdf' },
      { path: '/ocb',                   title: 'Оранжевая Католическая Библия',             filename: '02-оранжевая-католическая-библия.pdf' },
      { path: '/fafrelakh_law',         title: 'Закон о Фафрелахе',                         filename: '03-закон-о-фафрелахе.pdf' },
      { path: '/nobility_law',          title: 'Закон о благородстве и дворянстве',         filename: '04-закон-о-благородстве-и-дворянстве.pdf' },
      { path: '/nobility_law2',         title: 'Закон о становлении и низложении домов',    filename: '05-закон-о-становлении-и-низложении-домов.pdf' },
      { path: '/gold_law',              title: 'Закон о получении статуса Золото',          filename: '06-закон-о-получении-статуса-золото.pdf' },
      { path: '/Landsraads_regulations',title: 'Закон о регламенте Ландсраада',            filename: '07-закон-о-регламенте-ландсраада.pdf' },
      { path: '/criminal_law',          title: 'Закон о порядке уголовных разбирательств',  filename: '08-закон-о-порядке-уголовных-разбирательств.pdf' },
      { path: '/criminal_law2',         title: 'Закон об уголовных преступлениях',          filename: '09-закон-об-уголовных-преступлениях.pdf' },
    ],
  },
];

// Count total pages for progress tracking
const TOTAL_PAGES = PAGES.reduce((sum, group) => sum + group.pages.length, 0);

// ─── HTML Template ───────────────────────────────────────────────────────────
function buildHtml(title, bodyText) {
  // Wrap each paragraph block in <p> tags
  const paragraphs = bodyText
    .split('\n\n')
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      // Escape HTML entities
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

// ─── Content Extraction ──────────────────────────────────────────────────────
async function extractContent(page) {
  return page.evaluate(() => {
    const blocks = document.querySelectorAll('#allrecords .r.t-rec');
    const texts = [];
    blocks.forEach(b => {
      // Skip navigation blocks
      if (b.querySelector('.t228')) return;
      const text = b.innerText.trim();
      if (!text) return;
      // Skip footer branding, search, and scroll-top links
      if (text.includes('@МГ') || text.includes('Искать по сайту') || text === 'Наверх') return;
      texts.push(text);
    });
    return texts.join('\n\n');
  });
}

// ─── Ensure Playwright is installed ──────────────────────────────────────────
async function ensurePlaywright() {
  try {
    await import('playwright');
  } catch {
    console.log('[SETUP] Playwright not found. Installing...');
    const { execSync } = await import('child_process');
    execSync('npm install playwright', { stdio: 'inherit', cwd: import.meta.url.replace(/\/[^/]+$/, '/../') });
  }
  // Ensure browsers
  const { execSync } = await import('child_process');
  try {
    execSync('npx playwright install chromium', { stdio: 'pipe' });
  } catch {
    // May already be installed
  }
}

// ─── Create output directories ───────────────────────────────────────────────
function ensureDirectories() {
  for (const group of PAGES) {
    const dir = join(OUTPUT_ROOT, group.folder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`[DIR]  Created: ${dir}`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Duna 2026 — Rules PDF Scraper');
  console.log(`  Source: ${BASE_URL}`);
  console.log(`  Output: ${OUTPUT_ROOT}`);
  console.log(`  Pages:  ${TOTAL_PAGES}`);
  console.log('═══════════════════════════════════════════\n');

  await ensurePlaywright();
  ensureDirectories();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let completed = 0;
  const failed = [];

  for (const group of PAGES) {
    console.log(`\n── ${group.folder} ──`);

    for (const entry of group.pages) {
      const url = `${BASE_URL}${entry.path}`;
      const filepath = join(OUTPUT_ROOT, group.folder, entry.filename);
      completed++;

      try {
        console.log(`[${completed}/${TOTAL_PAGES}] Loading: ${entry.path}`);

        // Navigate with timeout
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Extra wait for Tilda dynamic content to render
        await page.waitForTimeout(500);

        // Extract content
        const content = await extractContent(page);

        if (!content || content.length < 50) {
          console.warn(`[WARN]  Very little content extracted for "${entry.title}" — PDF may be sparse`);
          // Continue anyway — some pages may be short
        }

        // Build HTML
        const html = buildHtml(entry.title, content);

        // Render to PDF
        await page.setContent(html, { waitUntil: 'networkidle', timeout: 15000 });
        await page.pdf({
          path: filepath,
          format: 'A4',
          margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
          printBackground: false,
          displayHeaderFooter: false,
        });

        console.log(`  ✔ Saved: ${entry.filename} (${content.length} chars)`);
      } catch (err) {
        console.error(`  ✘ FAILED: ${entry.path} — ${err.message}`);
        failed.push({ path: entry.path, title: entry.title, error: err.message });
      }

      // Polite delay between requests
      await page.waitForTimeout(500);
    }
  }

  await browser.close();

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log(`  DONE: ${completed - failed.length}/${TOTAL_PAGES} pages saved`);
  if (failed.length > 0) {
    console.log(`  FAILED: ${failed.length} pages:`);
    for (const f of failed) {
      console.log(`    - ${f.path} (${f.title}): ${f.error}`);
    }
  }
  console.log(`  Output: ${OUTPUT_ROOT}`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n[FATAL] Scraper crashed:', err.message);
  process.exit(1);
});
