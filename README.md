# evkarn-vite

Vite-сборка для вёрстки статического сайта: SCSS, HTML-включения, SVG-спрайты, картинки WebP/AVIF, деплой. Один сайт — `src/index.html`. Тестов нет. Node >= 20.

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
| `npm run fonts` | TTF→woff2 (`src/assets/fonts/` → `public/assets/fonts/`) + генерация `src/styles/scss/fonts/_fonts-faces.scss`. Standalone, вне сборки |
| `npm run copy-static` | Копирует favicon/файлы/конфигурацию в `public/`. Standalone |
| `npm run deploy:zip` / `deploy:ftp` / `deploy:ssh` | Сначала сами запускают `build`, затем выгружают сборку (zip-архив в корне проекта, FTP/SFTP). Данные подключения — только из `.env` (скопировать `.env.example`) |
| `npm run lint` | eslint + stylelint + prettier check; `npm run lint:fix` — автофикс |

## Структура

```text
src/                  # корень Vite (root: 'src')
  index.html          # единственная страница, директивы @include/@loop
  assets/             # исходники ассетов → public/assets/**
    images/           # картинки (оптимизация + webp/avif)
    fonts/            # TTF-шрифты (npm run fonts)
    svg/sprite|static/# спрайтовые и статические SVG
    favicon/, files/  # npm run copy-static
  includes/           # HTML-фрагменты: layouts/, sections/, elements/
  js/                 # scripts.js — entrypoint; modules/, utils/, constants/, libs/
  styles/scss/        # SCSS (settings, mixins, vars, секции)
public/               # генерируется сборкой: отдаётся как есть в dev и копируется в dist. Не редактировать руками
dist/                # результат сборки (outDir '../dist')
scripts/             # Vite-плагины и standalone-скрипты деплоя
.vscode/             # настройки редактора + сниппеты (*.code-snippets)
```

## JS (`src/js/functions/`)

Личный архив готовых UI-сниппетов: каждая папка — самодостаточный набор `*-func.js` (логика) + `.html` (разметка-шаблон) + стили (`.scss`/`.sass`). Не часть сборки, не линтится, **намеренно** может содержать невалидный JS.

| Категория | Папки |
| --- | --- |
| Навигация | `burger`, `nav-submenu`, `nav-active-link`, `create-page-nav-items`, `pagination` |
| Модальные окна / лайтбоксы | `micromodal`, `hystmodal`, `modal-evkarn`, `fs-lightbox`, `photo-swipe` |
| Формы и поля ввода | `input-mask`, `validation-forms`, `show-hide-password`, `select-display-none`, `select-expanded`, `no-ui-slider` |
| Контент / виджеты | `spoilers`, `tabs`, `ticker`, `timer-countdown`, `stepper`, `show-more`, `search`, `sorting`, `rating`, `quiz`, `portfolio`, `digital-counters`, `read-progress-circle/line` |
| Медиа | `video`, `swiper`, `slider-switch-images`, `image-in-bg`, `set-images-orientation-classes` |
| UX / скролл | `go-back-top`, `scroll-to-element`, `link-scroll-to-element`, `disable-scroll`/`enable-scroll`, `tooltip`, `switch`, `color-scheme`, `dynamic-adapt` (есть свой README.md) |
| Прочее | `webp-avif-support`, `yandex-metrika-with-cookie`, `cookie-popup`, `likely`, `orphus` (+ PHP), `scheme-org`/`open-graph` (schema.org микроданные) |

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

- **Корень — `src/`**, а не корень проекта (`root: 'src'`, publicDir `../public`, outDir `../dist`). Пути к ассетам в HTML/CSS — относительные от `src/`.
- **HTML-включения** (`scripts/file-include-plugin.js`): внутри `.html` директивы `@include('path', {params})` и `@loop(template, data)`; пути разрешаются относительно **корня проекта** (как `@root`). Блоки `<pre>/<code>` игнорируются.
- **Картинки**: `src/assets/images/**` → в `public/assets/images/` оптимизированный оригинал + копии `.webp`/`.avif` (quality 80). Инкрементально, по mtime.
- **SVG**: спрайт из `src/assets/svg/sprite/**` → `public/assets/svg/sprite/sprite.svg`; статические иконки — как есть в `public/assets/svg/static/`.
- **Шрифты** (`npm run fonts`): каждый TTF → woff2, по списку woff2 генерируется `_fonts-faces.scss` (вариативные шрифты — `format('woff2-variations')`).
- **SCSS**: импорты разрешаются через loadPaths (`src`, `src/components`, `src/styles/scss`, `vars`). PostCSS-цепочка (`postcss.config.js`): autoprefixer, preset-env, sort-media-queries (desktop-first), px-to-rem, cssnano.
- **Алиасы** (`vite.config.js`): `@`, `@components`, `@funcs`, `@utils`, `@modules`, `@constants`, `@styles`, `@js`.
- `assetsInlineLimit: 0` — ассеты в HTML/CSS **не инлайнятся** в data-URI, отдаются файлами.

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

## Lint / форматирование

- ESLint — flat config, раздельные окружения: `src/**` = браузерные глобалы; `vite.config.js`, `postcss.config.js`, `scripts/**` = node-глобалы.
- `src/js/**` не линтится, кроме entrypoint `scripts.js`; `src/js/functions/` — личный архив сниппетов, **намеренно** не валидный JS — не «чинить».
- Многие правила eslint в `src/**` намеренно понижены до warning (исторический код), чтобы `npm run lint` не падал посреди работы.
