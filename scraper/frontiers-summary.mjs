import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Config ──────────────────────────────────────────────────────────
const OUTPUT_DIR = resolve(
  "C:/Users/user/Desktop/duna-rules/05-рубежи-саммари"
);
const OUTPUT_FILE = resolve(OUTPUT_DIR, "Рубежи-памятка-для-команды.pdf");

// ── Utils ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`[OK] Created directory: ${dir}`);
  }
}

// ── HTML Template ───────────────────────────────────────────────────
function buildHTML() {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Рубежи — Памятка для команды</title>
<style>
  /* ── Reset & Base ─────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                 "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
    line-height: 1.65;
    color: #3e2723;
    background: #faf3e0;
    padding: 28px 32px 40px;
    max-width: 800px;
    margin: 0 auto;
  }

  /* ── Typography ───────────────────────────────────── */
  h1 {
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    color: #5d4037;
    border-bottom: 3px double #c9a96e;
    padding-bottom: 10px;
    margin-bottom: 6px;
    letter-spacing: 1px;
  }

  .subtitle {
    text-align: center;
    font-size: 13px;
    color: #8d6e63;
    margin-bottom: 24px;
    font-style: italic;
  }

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: #4e342e;
    border-left: 4px solid #c9a96e;
    padding-left: 10px;
    margin: 28px 0 10px 0;
  }

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #5d4037;
    margin: 16px 0 6px 0;
  }

  p, li { margin-bottom: 6px; }

  ul, ol { padding-left: 22px; margin-bottom: 8px; }

  li { margin-bottom: 4px; }

  strong { color: #3e2723; }

  em { color: #6d4c41; }

  /* ── Sections ─────────────────────────────────────── */
  .section { margin-bottom: 10px; }

  .danger-note {
    background: #fff3e0;
    border-left: 4px solid #e65100;
    padding: 10px 14px;
    margin: 10px 0;
    border-radius: 0 6px 6px 0;
  }

  .info-note {
    background: #e8f5e9;
    border-left: 4px solid #2e7d32;
    padding: 10px 14px;
    margin: 10px 0;
    border-radius: 0 6px 6px 0;
  }

  /* ── Dungeon Types ────────────────────────────────── */
  .dungeon-card {
    background: #fff8f0;
    border: 1px solid #e0d0b0;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 8px 0;
    page-break-inside: avoid;
  }

  .dungeon-card h3 {
    margin-top: 0;
    color: #4e342e;
  }

  .dungeon-card p {
    margin-bottom: 2px;
  }

  /* ── Checklist ────────────────────────────────────── */
  .checklist {
    background: #fffef8;
    border: 2px solid #c9a96e;
    border-radius: 8px;
    padding: 0;
    margin: 14px 0;
    overflow: hidden;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 12.5px;
    line-height: 1.75;
  }

  .checklist-header {
    background: #c9a96e;
    color: #3e2723;
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .checklist-body {
    padding: 10px 14px;
  }

  .checklist-body div {
    white-space: pre-wrap;
  }

  .check {
    color: #2e7d32;
    font-weight: bold;
  }

  /* ── Key Info Table ───────────────────────────────── */
  .key-info-grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 4px 10px;
    background: #fff8f0;
    border: 1px solid #e0d0b0;
    border-radius: 6px;
    padding: 12px 14px;
    margin: 8px 0;
    font-size: 12.5px;
    page-break-inside: avoid;
  }

  .key-label {
    font-weight: 700;
    color: #5d4037;
  }

  .key-value {
    color: #3e2723;
  }

  /* ── Ways Boxes ───────────────────────────────────── */
  .way-box {
    background: #fff8f0;
    border: 1px solid #e0d0b0;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 8px 0;
    page-break-inside: avoid;
  }

  .way-box h3 {
    margin-top: 0;
    color: #4e342e;
    font-size: 13px;
  }

  /* ── Contacts ─────────────────────────────────────── */
  .contacts {
    background: #f5f0e8;
    border: 1px solid #d7ccc8;
    border-radius: 6px;
    padding: 12px 14px;
    margin: 10px 0;
    page-break-inside: avoid;
  }

  .contacts p {
    margin-bottom: 3px;
  }

  .tg {
    color: #6d4c41;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 12px;
  }

  /* ── Rules for Bar ────────────────────────────────── */
  .rules-list {
    background: #fff8f0;
    border: 1px solid #e0d0b0;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 8px 0;
  }

  .rules-list li {
    margin-bottom: 5px;
  }

  /* ── Footer ───────────────────────────────────────── */
  .footer {
    text-align: center;
    font-size: 11px;
    color: #8d6e63;
    margin-top: 30px;
    padding-top: 12px;
    border-top: 1px solid #d7ccc8;
  }

  /* ── Print ────────────────────────────────────────── */
  @page {
    size: A4;
    margin: 15mm 12mm 18mm 12mm;
  }

  @media print {
    body { background: #fff; color: #000; }
    .checklist { border-color: #999; }
    .checklist-header { background: #ddd; }
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- HEADER                                                          -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<h1>РУБЕЖИ</h1>
<p class="subtitle">Памятка для команды &bull; Dune 2026 LARP &bull; duna2026.ru/frontiers</p>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 1: ЧТО ТАКОЕ РУБЕЖИ                                    -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>1. Что такое Рубежи и зачем туда идти</h2>

  <p><strong>Рубежи</strong> — это данжены и мерцающие локации, расположенные <em>вне основной игры</em>.
  Физически они находятся в соседнем помещении/корпусе, куда игроки приходят на ограниченное время.</p>

  <h3>Три цели похода в Рубежи:</h3>
  <ol>
    <li><strong>Игра в важные модели</strong> — экономика, политика, война, добыча ресурсов. То, что сложно или невозможно отыграть на основном полигоне.</li>
    <li><strong>Обогащение сюжета</strong> — Рубежи дают информацию, которой нет в основной игре. Сюжетные линии переплетаются, создавая глубину.</li>
    <li><strong>Получение ценностей</strong> — гаджеты, схемы, пряность и другие ресурсы, которые можно использовать в основной игре.</li>
  </ol>

  <div class="danger-note">
    <strong>Важно:</strong> Рубежи — это <em>дополнение</em> к основной истории, а не способ «выиграть» игру.
    Не надо гриндить данжены в ущерб ролевой игре на полигоне.
  </div>

  <div class="danger-note">
    <strong>В Рубежах возможна смерть персонажа.</strong> Некоторые данжены боевые — продумайте риски перед входом.
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 2: ТИПЫ ДАНЖЕНОЙ                                        -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>2. Типы данженов</h2>

  <div class="dungeon-card">
    <h3>1. Мертвятник</h3>
    <p><strong>Для кого:</strong> только для умерших персонажей.</p>
    <p><strong>Как попасть:</strong> после смерти персонаж надевает белый хайратник, выходит из игры и идёт в Рубежи ко входу «Мертвятник».</p>
    <p><strong>Что происходит:</strong> специальная игра после смерти. Затем персонаж выходит из Мертвятника в <em>новой роли</em> и продолжает участвовать в игре.</p>
  </div>

  <div class="dungeon-card">
    <h3>2. Бэттлграунды</h3>
    <p><strong>Что это:</strong> сражения — атаки на экономику и планеты Великих Домов, битвы фрименов против войск губернатора за контроль над Дюной.</p>
    <p><strong>Формат:</strong> тактические и стратегические боевые столкновения с модельными последствиями для основной игры.</p>
  </div>

  <div class="dungeon-card">
    <h3>3. Великая Пустыня</h3>
    <p><strong>Что это:</strong> локация для перемещения между Арракином и сиетчами, кустарной добычи пряности и открытия занесённых песком тайн.</p>
    <p><strong>Как работает:</strong> идёте из сиетча в Арракин (или наоборот) — по пути заходите во вход Великой Пустыни. Это часть игрового мира, соединяющая ключевые точки.</p>
  </div>

  <div class="dungeon-card">
    <h3>4. Харвестер</h3>
    <p><strong>Что это:</strong> локация добычи Пряности и сражений за результат этой добычи.</p>
    <p><strong>Как работает:</strong> участников забирают от Арракина в нужное время и доставляют к харвестеру. Там происходит добыча, после чего возможен бой за добытое.</p>
  </div>

  <div class="dungeon-card">
    <h3>5. Данжен «Память»</h3>
    <p><strong>Что это:</strong> единое информационное пространство вне места и времени. Главная ценность — <em>информация</em>.</p>
    <p><strong>Как попасть:</strong></p>
    <ul>
      <li>Приняв много Пряности</li>
      <li>Выпив Воду Памяти</li>
      <li>Используя техники Бене Гессерит</li>
    </ul>
    <p>Вход — через специальный портал «не по игре» из Глубокой Пустыни.</p>
  </div>

  <div class="dungeon-card">
    <h3>6. Мерцающая локация</h3>
    <p><strong>Что это:</strong> каждый раз новое событие или место. Появляется по особому расписанию.</p>
    <p><strong>Примеры:</strong> турнир в покер, аукцион запрещённых ценностей, сбор криминала.</p>
    <p><strong>Особенность:</strong> никогда не знаешь заранее, что именно будет — следите за объявлениями.</p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 3: КАК ПОПАСТЬ В РУБЕЖИ                                 -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>3. Как попасть в Рубежи — три способа</h2>

  <div class="way-box">
    <h3>Способ 1: Вход находится в игровых локациях</h3>
    <p>Некоторые входы в Рубежи расположены прямо на полигоне, в игровом пространстве.</p>
    <p><strong>Примеры:</strong></p>
    <ul>
      <li>Идёте из сиетча в Арракин → по пути заходите во вход <strong>Великой Пустыни</strong></li>
      <li>Участвуете в добыче Пряности → вас забирают от Арракина к <strong>харвестеру</strong></li>
    </ul>
    <p>В этом случае Рубежи — естественное продолжение вашего игрового маршрута.</p>
  </div>

  <div class="way-box">
    <h3>Способ 2: По ключу</h3>
    <p>Самый распространённый способ. У вас есть <strong>ключ</strong> (сертификат) на определённый данжен.</p>
    <p><strong>Порядок действий:</strong></p>
    <ol>
      <li>Садитесь на хайлайнер из Арракина или Кайтайна</li>
      <li>По пути выходите в Рубежах (физически идёте в соседний корпус)</li>
      <li>Заходите через основной вход с табличкой <strong>«Бар Хайлайнера»</strong></li>
    </ol>
  </div>

  <div class="way-box">
    <h3>Способ 3: Прямое указание в правилах</h3>
    <p>Некоторые правила игры прямо предписывают идти в определённый данжен.</p>
    <p><strong>Пример:</strong> персонаж умер → надеваете белый хайратник → <em>не по игре</em> идёте в Рубежи → заходите во вход «Мертвятник».</p>
    <p>В этом случае ключ не нужен — правило само даёт доступ.</p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 4: КЛЮЧИ                                               -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>4. Ключи — что это и как получить</h2>

  <p><strong>Ключ</strong> — это особый сертификат, который даёт право на вход в конкретный данжен в конкретное время.</p>

  <h3>Что указано на ключе:</h3>
  <div class="key-info-grid">
    <div class="key-label">Код</div>
    <div class="key-value">Для идентификации ключа</div>

    <div class="key-label">Какой данжен</div>
    <div class="key-value">Название и тип данжена</div>

    <div class="key-label">Дата и время</div>
    <div class="key-value"><strong>В другое время ключ не сработает!</strong></div>

    <div class="key-label">Численность</div>
    <div class="key-value">Сколько человек может войти (обычно владелец + 5 = 6)</div>

    <div class="key-label">Материальный ли</div>
    <div class="key-value">Можно ли отнять при обыске? Если да — прячьте надёжно!</div>

    <div class="key-label">Передаваемый ли</div>
    <div class="key-value">Можно ли передать другому персонажу?</div>

    <div class="key-label">Оплата хайлайнера</div>
    <div class="key-value">Включена ли стоимость проезда на хайлайнере в ключ</div>

    <div class="key-label">Краткое описание</div>
    <div class="key-value">Что ждать от данжена</div>

    <div class="key-label">Возрастные ограничения</div>
    <div class="key-value">Если есть — указаны на ключе</div>
  </div>

  <h3>Как получить ключи:</h3>
  <ul>
    <li><strong>Крупные фракции</strong> получают ключи каждый день → глава фракции распределяет между своими</li>
    <li><strong>Публичные продажи</strong> за большие деньги — онлайн-торги</li>
    <li><strong>Выиграть на турнире</strong> или купить на аукционе в игре</li>
  </ul>

  <div class="info-note">
    <strong>Важно:</strong> всего около 35–40 ключей в день. Попасть в данжен можно <em>только по ключу</em>.
    Один и тот же данжен не рекомендуется проходить больше 1–2 раз за игру — дайте шанс другим.
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 5: ОСОБЫЕ ПРАВИЛА                                       -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>5. Особые правила и предуcловия</h2>

  <h3>Тайминг</h3>
  <ul>
    <li>Среднее время прохождения данжена: <strong>~45 минут</strong></li>
    <li>При наличии ключа на конкретное время — <strong>НЕЛЬЗЯ опаздывать!</strong> Опоздавших не пускают.</li>
    <li>Будет опубликовано расписание работы Рубежей и график данженов — следите за обновлениями.</li>
  </ul>

  <h3>Входы в Рубежи (всего 3)</h3>
  <ol>
    <li><strong>Мертвятник</strong> — для умерших и выкупающих членов команды</li>
    <li><strong>Вход «не по игре»</strong> — в данжен «Память» из Глубокой Пустыни</li>
    <li><strong>Бар Хайлайнера</strong> — основной вход для всех по ключу</li>
  </ol>

  <h3>Правила Бара Хайлайнера</h3>
  <div class="rules-list">
    <ul>
      <li>Нельзя драться</li>
      <li>Запрещено большинство модельных взаимодействий</li>
      <li>Можно и нужно <strong>говорить по игре</strong>, взаимодействовать с персонажами</li>
      <li>Бармен <em>неофициально</em> покупает ценности из данженов — не привлекайте внимание</li>
      <li>Можно выпить чай, кофе, воду и ждать своей очереди</li>
      <li><strong>Игротехники сами отведут в данжен</strong> — НЕ ИСКАТЬ САМОСТОЯТЕЛЬНО!</li>
    </ul>
  </div>

  <h3>Взаимодействие с игротехниками</h3>
  <ul>
    <li><strong>Жёлтый платок / бандана</strong> = игротехник. Слушаться указаний.</li>
    <li><strong>Жёлтая лента</strong> на костюмированном = слушаться модельных указаний этого персонажа.</li>
    <li><strong>Зелёная лента</strong> на костюмированном = НЕЛЬЗЯ атаковать или модельно воздействовать на этого персонажа.</li>
  </ul>

  <h3>Общие правила</h3>
  <ul>
    <li>У каждого данжена свои внутренние правила — <strong>доверяйте игротехникам</strong></li>
    <li>Встреченные NPC могут врать и использовать вас в своих целях</li>
    <li>Игротехники вне Рубежей встречаются редко (почти никогда)</li>
    <li>Вне Рубежей могут быть данжены, созданные игроками (с мастерскими сертификатами)</li>
    <li><strong>Нельзя</strong> посылать «виртуальный» флот или виртуальные заявки</li>
    <li><strong>Нельзя</strong> вести переписку с NPC из Рубежей вне данжена</li>
  </ul>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 6: ЧЕК-ЛИСТ                                             -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>6. Чек-лист для команды</h2>
  <p>Распечатайте и повесьте в штабе. Пройдитесь по каждому пункту перед выходом.</p>

  <div class="checklist">
    <div class="checklist-header">ПАМЯТКА: ПЕРЕД ПОХОДОМ В РУБЕЖИ</div>
    <div class="checklist-body">
<div>☐ Проверь ключ: дата, время, число людей
☐ Оплачен ли хайлайнер?
☐ Ключ материальный? Спрячь надёжно!
☐ Ключ передаваемый? Кто главный в группе?
☐ НЕ ОПАЗДЫВАЙ на хайлайнер!
☐ В баре: НЕ ДРАТЬСЯ, можно общаться
☐ Жёлтый платок = мастер, слушаться
☐ Зелёная лента = неприкосновенный NPC
☐ В данжене ~45 мин, возможна смерть
☐ NPC могут врать и использовать вас
☐ Добычу можно продать бармену
☐ Не ищи данжен сам — тебя отведут
☐ Виртуальные заявки/флот — НЕЛЬЗЯ</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- РАЗДЕЛ 7: КОНТАКТЫ                                             -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="section">
  <h2>7. Контакты</h2>

  <div class="contacts">
    <p><strong>Иван Кузьмин</strong> — главный по всем вопросам<br>
    <span class="tg">tg: iskuzmin1989</span></p>

    <p><strong>Александра</strong> — администратор<br>
    <span class="tg">tg: @Leasfer</span></p>

    <p><strong>Сара</strong> — главная за данжены<br>
    <span class="tg">tg: @mraczynska</span></p>

    <p><strong>Ира Якушева</strong> — главная за игротехников<br>
    <span class="tg">tg: @ginny_oll</span></p>
  </div>

  <p style="font-size:12px; color:#8d6e63; margin-top:6px;">
    По любым вопросам о Рубежах — пишите Саре. По игротехникам — Ире. Всё остальное — Ивану.
  </p>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- FOOTER                                                          -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div class="footer">
  Dune 2026 LARP &bull; duna2026.ru/frontiers &bull; Версия 1.0
</div>

</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log("=== Duna Frontiers PDF Generator ===\n");

  // 1. Ensure output directory
  console.log("[1/4] Creating output directory...");
  ensureDir(OUTPUT_DIR);

  // 2. Build HTML
  console.log("[2/4] Building HTML content...");
  const html = buildHTML();
  console.log(`      HTML size: ${(html.length / 1024).toFixed(1)} KB`);

  // 3. Launch browser and render PDF
  console.log("[3/4] Launching Chromium and rendering PDF...");
  const browser = await chromium.launch({ headless: true });

  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.pdf({
      path: OUTPUT_FILE,
      format: "A4",
      margin: {
        top: "15mm",
        bottom: "18mm",
        left: "12mm",
        right: "12mm",
      },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });

    console.log(`      PDF written: ${OUTPUT_FILE}`);
  } finally {
    await page?.close();
    await browser.close();
  }

  // 4. Verify
  console.log("[4/4] Verifying output...");
  if (existsSync(OUTPUT_FILE)) {
    const { size } = await import("fs").then((fs) => fs.statSync(OUTPUT_FILE));
    console.log(`      File exists: YES (${(size / 1024).toFixed(1)} KB)`);
  } else {
    throw new Error(`Output file not found: ${OUTPUT_FILE}`);
  }

  console.log("\n=== Done ===");
  console.log(`PDF: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("\n[FATAL]", err.message || err);
  process.exit(1);
});
