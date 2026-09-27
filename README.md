# evkarn-vite

Vite-сборка для вёрстки статического сайта: SCSS, HTML-включения, SVG-спрайты, картинки WebP/AVIF, деплой. Один сайт — `src/index.html`. Тестов нет. Node >= 20.

## Статус

Актуально на 27.09.2026. Это рабочая сборка и личный архив сниппетов, а не библиотека.

- **Сборка** (`vite.config.js`, `scripts/`, `.env.example`) — рабочая и описанная: ассеты вне root, включения, спрайты, шрифты, типограф, деплой. На неё можно опираться, дописывается неторопливо.
- **`src/js/functions/**`** — личный архив сниппетов, **в работе**: многое не дописано, стили и разметка могут отставать от логики (папки, которые не запустились бы как есть, помечены `*` в таблице ниже — сейчас таких нет). Массово не «чиню», дописываю по мере надобности. Берите как каталог идей и как источник для разбора, а не как готовую библиотеку.
- **`.vscode/*.code-snippets`** — сниппеты редактора, тоже дописываются на ходу.
- **Проверки** — `npm run lint` (сборка) + `npm run js-snippets:check` (синтаксис архива сниппетов). Тестов и CI нет.

## Быстрый старт

```bash
npm install
npm run dev      # dev-сервер на :3000
npm run build   # сборка в dist/
```

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Dev-сервер на порту 3000, watch картинок |
| `npm run build` | Сборка в `dist/`; минификация HTML управляется переменной `HTML_MINIFY` в `.env` (по умолчанию включена) |
| `npm run preview` | Локальный просмотр собранного `dist/` |
| `npm run fonts` | TTF→woff2 (`assets/fonts/` → `src/assets/fonts/`) + генерация `src/styles/scss/fonts/_fonts-faces.scss`. Standalone, вне сборки |
| `npm run js-snippets` | Печатает список папок `src/js/functions/` по категориям; `-- --write` обновляет таблицу сниппетов в этом README. Не путать со сниппетами `.vscode/*.code-snippets` |
| `npm run js-snippets:check` | Синтаксическая проверка архива сниппетов (eslint с `--no-ignore --quiet`). Падает только на `Parsing error` — файле, который не запустится; warnings вроде `prefer-const` проходят молча. Не входит в `npm run lint` |
| `npm run deploy:zip` / `deploy:ftp` / `deploy:ssh` | Сначала сами запускают `build`, затем выгружают сборку (zip-архив в корне проекта, FTP/SFTP). Данные подключения — только из `.env` (скопировать `.env.example`) |
| `npm run lint` | eslint + stylelint + prettier check; `npm run lint:fix` — автофикс |

## Структура

```text
assets/                # ИСХОДНИКИ ассетов. Вне root Vite, плагины их не трогают
  images/              # картинки (jpg — оригиналы, webp/avif генерируются)
  fonts/               # TTF-шрифты (npm run fonts)
  svg/sprite|static/   # спрайтовые и статические SVG
public/                # уходит на сервер как есть, без обработки. Всё ручное
  assets/files/        # PHPMailer (require из обработчиков)
  mail-uni.php         # обработчик формы: принимает POST, отвечает JSON
  mail-uni-with-recaptch-v3-google.php  # то же + проверка reCAPTCHA v3
  config.php           # SMTP-доступы. Локальный файл, в git не хранится
  .htaccess, robots.txt
src/                   # корень Vite (root: 'src')
  index.html           # единственная страница, директивы @include/@loop
  assets/              # ГЕНЕРИРУЕТСЯ плагинами из assets/, в git не хранится
  includes/            # HTML-фрагменты: layouts/, sections/, elements/, schema-org/
  js/                  # scripts.js — entrypoint; modules/, utils/, constants/, libs/
  styles/scss/         # SCSS (settings, mixins, vars, секции)
dist/                  # результат сборки (outDir '../dist')
scripts/               # плагины сборки + standalone-скрипты
  file-include-plugin.js, normalize-asset-urls.js   # разбор HTML: @include/@loop, ссылки на ассеты
  image-plugin.js, svg-sprite.js, svg-icons.js      # assets/ → src/assets/
  html-minify-plugin.js, typograf-plugin.js         # постобработка HTML
  convert-fonts.mjs, deploy-{zip,ftp,ssh}.mjs       # standalone: шрифты, выгрузка сборки
  list-js-snippets.mjs                             # standalone: список папок src/js/functions
.vscode/               # настройки редактора + сниппеты (*.code-snippets)
```

### Как ассет попадает в `dist`

```text
assets/images/about/img-about.jpg          исходник, не перезаписывается
  → [image-plugin, sharp] → src/assets/images/about/img-about.{jpg,webp,avif}
  → [Vite, assetFileNames] → dist/assets/images/about/img-about.{jpg,webp,avif}
```

В `dist/assets/` пишет **только** Vite, поэтому дублей не бывает. `public/` —
отдельный, независимый канал: то, что лежит там, копируется в `dist` дословно.

### Ссылки на ассеты

В статическом HTML пиши **относительно**: `assets/images/about/img-about.jpg`.
Плагин `scripts/normalize-asset-urls.js` переводит их в `/assets/...` перед
тем, как Vite начнёт резолвить, иначе вложенная страница (`blog/post.html`)
искала бы папку `assets` рядом с собой. Дальше Vite сам проставляет
относительный от глубины готовой страницы: `./assets/...` в корне,
`../assets/...` во вложенной, и падает с ошибкой, если файла нет.

Исключение — разметка из `src/js/functions/**`: она попадает в DOM в рантайме,
Vite её не видит, поэтому там пути **абсолютные** (`/assets/...`).
Соответствующие сниппеты — с суффиксом `-abs` в `.vscode/html-images.code-snippets`.

## JS (`src/js/functions/`)

Личный архив готовых UI-сниппетов: каждая папка — самодостаточный набор `*-func.js` (логика) + `.html` (разметка-шаблон) + стили (`.scss`/`.sass`). Не часть сборки, не линтится, **намеренно** может содержать невалидный JS. Рядом лежит общий `vars.js` — часто используемые селекторы (`[data-burger]`, `[data-nav]` и т.п.).

Список ниже генерируется, руками не правится:

```bash
npm run js-snippets              # напечатать текущий список
npm run js-snippets -- --write   # обновить таблицу ниже
```

Новая папка попадает в категорию сама — по имени, первым подошедшим правилом из `CATEGORIES` в `scripts/list-js-snippets.mjs` (`get-*`, `set-element-*`, `window-*` → служебные утилиты и т.д.). Если не подошло ни одно правило — папка попадёт в строку «Не разбрано», добавь правило. Не путать с `.vscode/*.code-snippets`: там сниппеты для редактора, здесь — папки с готовыми UI-решениями.

<!-- js-snippets:start -->

| Категория | Папки |
| --- | --- |
| Навигация и меню | `burger`, `create-page-nav-items`, `nav-active-link`, `nav-submenu`, `pagination` |
| Модальные окна / лайтбоксы | `fs-lightbox`, `hystmodal`, `micromodal`, `modal-evkarn`, `photo-swipe` |
| Формы и поля ввода | `input-mask`, `input-password-show-hide`, `no-ui-slider`, `search-field-google`, `select-display-none`, `select-expanded`, `show-hide-password`, `validation-forms` |
| Контент / виджеты | `digital-counters`, `filters`, `highlight-code`, `normal-price`, `portfolio`, `quiz`, `rating`, `read-progress-circle`, `read-progress-line`, `search`, `search-elements`, `show-more`, `sorting`, `spoilers`, `spoilers-new`, `stepper`, `tabs`, `ticker`, `timer-countdown` |
| Медиа | `image-in-bg`, `set-images-orientation-classes`, `simple-bar` (кастомный скроллбар), `slider-switch-images`, `swiper`, `video` |
| Анимация | `aos` |
| Служебные утилиты | `check-viewport`, `document-listener-click`, `get-data`, `get-element-height`, `get-full-year`, `get-scroll-width`, `set-element-min-height`, `set-min-height-elements`, `window-listener-resize`, `window-on-key-27-down` |
| UX / скролл и эффекты | `color-scheme`, `disable-scroll`, `dynamic-adapt` (есть свой README.md), `enable-scroll`, `go-back-top`, `link-scroll-to-element`, `offset-panel-phone`, `scroll-to-element`, `set-class-when-scrolling`, `slide-down`, `slide-toggle`, `slide-up`, `switch`, `tooltip` |
| Прочее | `cookie-popup`, `likely`, `open-graph` (schema.org микроданные), `orphus` (+ PHP), `scheme-org` (schema.org микроданные), `webp-avif-support`, `yandex-metrika-with-cookie` |
| Вендорные обёртки (`src/js/libs/`) | `accordion`, `equalheights`, `flaticon`, `fotorama`, `likely`, `magnificpopup`, `owlcarousel` |

<!-- js-snippets:end -->

Вендорные обёртки (последняя строка таблицы) лежат отдельно, в `src/js/libs/`.

## Редактор (`.vscode/`)

- `extensions.json` — рекомендуемые расширения: BEM-helper, Prettier, Stylelint, SCSS-formatter, spell-checker (+ русский), path/npm-intellisense и т.п.
- `settings/settings.json` — настройки workspace: табы = 2 пробела, autoSave afterDelay, `sass.loadPaths`; `mcp.json` — MCP-сервер fetch (uvx).
- Сниппеты — отдельными файлами по языкам (`*.code-snippets`):

| Язык | Файлы |
| --- | --- |
| HTML-разметка | `html-*`: burger, nav, pagination, section, images, swiper, video, headers, lists, select, sprite, fonts, logo, attr, background, blockquote, style-inline, articles |
| JavaScript | `javascript*`: fetch, function, cycles-iteration, import, json, variables, swiper |
| PHP | `php-*`: wordpress, carbon-fields, print-ar-result |
| Стили (SCSS) | `styles-*`: fluid-size (+rem), media-px/rem, ad-value, color, flex, grid, gap, states, transition, transform, animation, background, border, box-shadow, outline, overlay, position, pseudo-classes/elements, text-wrap, object-fit, pointer-events, use |

Файлы `*.backup` — архивные варианты, VS Code их не подгружает.

## Как устроена сборка

- **Корень — `src/`**, а не корень проекта (`root: 'src'`, publicDir `../public`, outDir `../dist`).

Порядок плагинов в `vite.config.js` важен — каждый следующий ждёт результат предыдущего:

```text
fileIncludePlugin       разворачивает @include/@loop
  → normalizeAssetUrls  assets/... → /assets/... (только после include!)
  → imagePlugin         assets/images/** → src/assets/images/** (+ webp/avif)
  → svgIconsPlugin      assets/svg/static/** → src/assets/svg/static/**
  → svgSpritePlugin     assets/svg/sprite/** → src/assets/svg/sprite/sprite.svg
  → htmlMinifyPlugin    опционально, отключается HTML_MINIFY=false
  → typografPlugin      последним, после минификации
```

- **HTML-включения** (`scripts/file-include-plugin.js`): внутри `.html` директивы `@include('path', {params})` и `@loop(template, data)`; пути разрешаются относительно **корня проекта** (как `@root`). Блоки `<pre>/<code>` игнорируются.
- **Нормализация ссылок** (`scripts/normalize-asset-urls.js`): хук `order: 'pre'`, стоит в `plugins` сразу после `file-include-plugin`. Переводит `assets/...` → `/assets/...` в `src`, `srcset`, `href`, `xlink:href`, `content`, `poster` и в `url(...)` инлайн-стилей и блоков `<style>`. Тело `<script>` не трогает.
- **Картинки**: `assets/images/**` → в `src/assets/images/` оптимизированный оригинал + копии `.webp`/`.avif` (quality 80). Инкрементально, по mtime. Исходники в `assets/` не перезаписываются.
- **SVG**: спрайт из `assets/svg/sprite/**` → `src/assets/svg/sprite/sprite.svg`; статические иконки проходят SVGO в `src/assets/svg/static/`.
- **Шрифты** (`npm run fonts`): каждый TTF из `assets/fonts/` → woff2 в `src/assets/fonts/`, по списку woff2 генерируется `_fonts-faces.scss` (вариативные шрифты — `format('woff2-variations')`).
- **Минификация HTML** (`scripts/html-minify-plugin.js`, только для build): включается, если в `.env` нет `HTML_MINIFY=false`.
- **Типограф** (`scripts/typograf-plugin.js`): итоговый HTML прогоняется через Типограф (неразрывные пробелы, «ёлочки», тире, кавычки). Не трогает `<head>`, `<pre>`, `<code>`, `<script>`, `<style>`, `<textarea>`. Выполняется **после** минификации, иначе неразрывные пробелы схлопываются. Отключается только кодом: `typografPlugin({ disable: [...] })`.
- **SCSS**: импорты разрешаются через loadPaths (`src`, `src/styles/scss`, `src/styles/scss/vars`, `node_modules`; в конфиге остался несуществующий `src/elements` — можно удалить). PostCSS-цепочка (`postcss.config.js`): autoprefixer, preset-env, sort-media-queries (desktop-first), px-to-rem, cssnano.
- **Алиасы** (`vite.config.js`): `@`, `@funcs`, `@utils`, `@modules`, `@constants`, `@styles`, `@js`. `@components` → `src/components` в конфиге есть, но такой папки в проекте нет.
- `assetsInlineLimit: 0` — ассеты в HTML/CSS **не инлайнятся** в data-URI, отдаются файлами.
- `build.rollupOptions.output.assetFileNames` — ассет кладётся в `dist` по тому же пути, что лежит внутри `src` (`src/assets/images/about/x.jpg` → `dist/assets/images/about/x.jpg`). Вложенность не схлопывается, хешей в именах нет. Для CSS/JS-чанков и файлов вне `root` остаётся стандартное `assets/[name]-[hash][extname]`.

## Несколько страниц (MPA)

Сейчас сайт одностраничный (`src/index.html`). Vite поддерживает мультистраничность:

- **Dev**: любой `.html` внутри `src/` сразу работает как отдельная страница — создайте `src/about.html` и откройте `/about.html`. Плагин включений обрабатывает все HTML-входные (transformIndexHtml).
- **Build**: свои страницы добавьте в `build.rollupOptions.input` (`vite.config.js`, там есть закомментированный пример):

```js
rollupOptions: {
  input: [
    fileURLToPath(new URL('./src/index.html', import.meta.url)),
    fileURLToPath(new URL('./src/about.html', import.meta.url)),
  ],
},
```

Все страницы делят одни и те же `@include`/`@loop`, стили и ассеты — других изменений не нужно.

## Конфигурация `.env`

Скопируйте `.env.example` → `.env` (в `.gitignore`, не попадает в репозиторий). Пароли и ключи — только туда, никогда не хардкодить:

```ini
# FTP (npm run deploy:ftp)
FTP_HOST=  FTP_USER=  FTP_PASSWORD=
#FTP_REMOTE_PATH=evkarn-vite   # папка на сервере (по умолчанию имя проекта)
#FTP_PARALLEL=5               # потоки загрузки
#FTP_SECURE=1                 # FTPS/TLS

# SSH/SFTP (npm run deploy:ssh)
SSH_HOST=  SSH_USER=  SSH_DESTINATION=/var/www/user/public_html/example.ru
#SSH_PORT=22
#SSH_PASSWORD=                # или ключ:
#SSH_PRIVATE_KEY_PATH=~/.ssh/id_rsa
#SSH_PARALLEL=5

# Минификация HTML при сборке (по умолчанию true)
HTML_MINIFY=false
```

SMTP-доступы для писем лежат отдельно: `public/config.example.php` → `public/config.php` (в `.gitignore`). Сам `config.php` попадает в `dist/` дословно, поэтому на сервере клади его **выше** веб-корня — обработчики `require`ят его как `../config.php`.

## Lint / форматирование

- ESLint — flat config, раздельные окружения: `src/**` = браузерные глобалы; `vite.config.js`, `postcss.config.js`, `scripts/**` = node-глобалы.
- `src/js/**` не линтится, кроме entrypoint `scripts.js`; `src/js/functions/` — личный архив сниппетов: 300+ warnings там норма (исторический код), поэтому линтер его не смотрит. Синтаксис архива проверяется отдельно — `npm run js-snippets:check`, она ловит только `Parsing error` (файл не запустится вообще). Ошибки рантайма (`ReferenceError` и подобные) проверка не видит — они всплывают при вставке в проект.
- Из проверок исключены `assets/**`, `src/assets/**` (сгенерированное), `public/**`, `dist/**`.
- Prettier (`.prettierignore`) проверяет только код сборки: `src/`, `assets/`, `public/`, `dist/`, `.vscode/` и `*.md` исключены (иначе разовый прогон по `src` дал бы коммит на тысячи строк). Замечания по JS в `src` всё равно видны через `npm run lint:js`.
- Многие правила eslint в `src/**` намеренно понижены до warning (исторический код), чтобы `npm run lint` не падал посреди работы.
