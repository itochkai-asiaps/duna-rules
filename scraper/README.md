# Duna 2026 — Rules Update Pipeline

Одной командой собирает правила игры с сайта [duna2026.ru](https://duna2026.ru) и Google Docs, сохраняет в PDF (для чтения) и текстовые файлы (для бота).

## Установка

```bash
cd C:\Users\user\AppData\Local\Temp\opencode\duna-scraper

# Установить Playwright
npm install playwright

# Установить браузер Chromium
npx playwright install chromium
```

Требуется **Node.js 18+** (встроенная поддержка fetch для Google Docs).

## Настройка

Все источники описаны в `config.json`. Это **единственный источник правды** — скрипт не содержит жёстко закодированных путей.

### Структура config.json

```json
{
  "baseUrl": "https://duna2026.ru",
  "outputDir": "C:/Users/user/Desktop/duna-rules",
  "corpusDir": "C:/Users/user/Desktop/duna-bot/corpus",
  "pages": [
    {
      "path": "/datesandpalce",
      "title": "Даты игры и полигон",
      "folder": "01-общие-правила",
      "file": "01-даты-игры-и-полигон"
    }
  ],
  "googleDocs": [
    {
      "id": "13Mj5crwneWwKWopbJ5OiQUH7s-9UfqAyUxGL295qJKM",
      "title": "Медицина",
      "folder": "02-модельные-правила",
      "file": "13-медицина",
      "note": "Полная версия с Google Docs"
    }
  ]
}
```

- `baseUrl` — корневой URL сайта
- `outputDir` — куда сохранять PDF (для чтения человеком)
- `corpusDir` — куда сохранять .txt (корпус для бота)

### Добавление новых страниц

Добавить объект в массив `pages`:
```json
{"path": "/new-page", "title": "Название", "folder": "02-модельные-правила", "file": "27-новая-страница"}
```

### Добавление нового Google Doc

Добавить объект в массив `googleDocs`:
```json
{"id": "DOCUMENT_ID", "title": "Название", "folder": "03-материалы", "file": "11-новый-документ", "note": "Описание"}
```

`DOCUMENT_ID` — из URL документа: `https://docs.google.com/document/d/DOCUMENT_ID/edit`

> ⚠️ Документ должен быть **общедоступным** (Anyone with the link can view).

## Запуск

```bash
node update-rules.mjs
```

Скрипт делает три вещи:

1. **Фаза 1** — обходит все страницы сайта, извлекает текст, сохраняет PDF + TXT
2. **Фаза 2** — скачивает Google Docs как текст, сохраняет PDF + TXT
3. **Фаза 3** — создаёт `corpus/manifest.json` с метаданными всех файлов

### Пример вывода

```
═══════════════════════════════════════════════
  Duna 2026 — Rules Update Pipeline
  Source: https://duna2026.ru
  Output: C:/Users/user/Desktop/duna-rules
  Corpus: C:/Users/user/Desktop/duna-bot/corpus
  Pages:  56
  Docs:   2
═══════════════════════════════════════════════

── Фаза 1: Сканирование сайта ──
[1/56] Даты игры и полигон
         ✔ PDF + TXT (3421 символов)
[2/56] Идея игры
         ✔ PDF + TXT (2890 символов)
...

── Фаза 2: Загрузка Google Docs ──
[DOC 1/2] Медицина (Google Docs)
         ✔ PDF + TXT (12450 символов)
[DOC 2/2] Общая структура локаций (Google Docs)
         ✔ PDF + TXT (8930 символов)

── Фаза 3: Манифест ──
[MANIFEST] C:\Users\user\Desktop\duna-bot\corpus\manifest.json
           58 файлов, 245 678 символов

═══════════════════════════════════════════════
  ГОТОВО: 58/58 файлов обработано
  Сайт:   56/56 страниц
  Доки:   2/2 документов
  PDF:    C:/Users/user/Desktop/duna-rules
  Корпус: C:/Users/user/Desktop/duna-bot/corpus
═══════════════════════════════════════════════
```

## Структура вывода

```
Desktop/
├── duna-rules/              ← PDF для чтения
│   ├── 01-общие-правила/
│   │   ├── 01-даты-игры-и-полигон.pdf
│   │   ├── 02-идея-игры.pdf
│   │   └── ...
│   ├── 02-модельные-правила/
│   │   ├── 01-фафрелах.pdf
│   │   ├── 13-медицина.pdf          ← Google Doc (перезаписывает сайт)
│   │   └── ...
│   ├── 03-материалы/
│   │   ├── 03-общая-структура-локаций.pdf  ← Google Doc
│   │   └── ...
│   └── 04-законы-империи/
│
└── duna-bot/
    └── corpus/               ← TXT для бота
        ├── manifest.json     ← каталог всех файлов
        ├── 01-общие-правила/
        │   ├── 01-даты-игры-и-полигон.txt
        │   └── ...
        ├── 02-модельные-правила/
        ├── 03-материалы/
        └── 04-законы-империи/
```

## manifest.json

```json
{
  "generatedAt": "2026-07-15T12:00:00.000Z",
  "baseUrl": "https://duna2026.ru",
  "totalFiles": 58,
  "totalChars": 245678,
  "files": [
    {
      "folder": "01-общие-правила",
      "file": "01-даты-игры-и-полигон.txt",
      "title": "Даты игры и полигон",
      "source": "website",
      "sourceUrl": "https://duna2026.ru/datesandpalce",
      "charCount": 3421
    }
  ],
  "folders": [...]
}
```

## Обновление перед игрой

Просто запусти `node update-rules.mjs` заново. Все PDF и TXT перезапишутся актуальными версиями. Google Docs **перезаписывают** одноимённые PDF со страниц сайта (например, медицина с Google Docs заменяет краткую версию с сайта).
