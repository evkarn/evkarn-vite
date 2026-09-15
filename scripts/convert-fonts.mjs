import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ttf2woff2 from 'ttf2woff2';

// Standalone-скрипт (вне Vite): конвертация шрифтов и генерация _fonts-faces.scss.
//
// 1. Каждый .ttf из src/assets/fonts/ → .woff2 в public/assets/fonts/
//    (public/ отдаётся как есть в dev и копируется в dist сборкой).
// 2. По списку .woff2 из public/assets/fonts/ генерируется
//    src/styles/scss/fonts/_fonts-faces.scss:
//    вариативные шрифты (VariableFont/VF) → format('woff2-variations')
//    + format('woff2') tech('variations'), обычные → вес/стиль из имени файла.
//    URL — абсолютные /assets/fonts/...: Vite пересчитывает их в корректный
//    относительный путь в собранном CSS (dist/assets/ → ../assets/fonts/).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.join(rootDir, 'src', 'assets', 'fonts');
const fontsDir = path.join(rootDir, 'public', 'assets', 'fonts');
const fontsFaces = path.join(
	rootDir,
	'src',
	'styles',
	'scss',
	'fonts',
	'_fonts-faces.scss',
);

// Конфиг генерации
const fontsVars = {
	preprocessor: 'scss',
	fontWeight: '100 900', // для вариативных шрифтов
	fontStretch: '', // например 'condensed' — пока не используется
};

const FONT_DISPLAY = 'font-display: swap';

/** Вес шрифта по имени файла */
function resolveWeight(weight) {
	const w = weight.toLowerCase();
	if (w === 'thin') return 100;
	if (w === 'extralight') return 200;
	if (w === 'light' || w === 'book' || w === 'demi') return 300;
	if (w === 'regular' || w === 'normal') return 400;
	if (w === 'medium') return 500;
	if (w === 'semibold' || w === 'demibold') return 600;
	if (w === 'bold') return 700;
	if (w === 'extrabold' || w === 'heavy') return 800;
	if (w === 'black' || w === 'ultrablack' || w === 'fat') return 900;
	return 400;
}

/** Стиль шрифта по имени файла */
function resolveStyle(style) {
	return String(style || '').toLowerCase() === 'italic' ? 'italic' : 'normal';
}

/** @font-face блок для вариативного шрифта */
function variableFontFace(fontName, file) {
	return [
		'@font-face {',
		`\tfont-family: ${fontName};`,
		`\tsrc: url('/assets/fonts/${file}') format('woff2-variations');`,
		`\tsrc: url('/assets/fonts/${file}') format('woff2') tech('variations');`,
		`\t${FONT_DISPLAY};`,
		`\tfont-weight: ${fontsVars.fontWeight};`,
		'}',
	].join('\n');
}

/** @font-face блок для статичного шрифта */
function staticFontFace(fontName, file, weight, style) {
	return [
		'@font-face {',
		`\tfont-family: ${fontName};`,
		`\tsrc: url('/assets/fonts/${file}') format('woff2');`,
		`\t${FONT_DISPLAY};`,
		`\tfont-weight: ${weight};`,
		`\tfont-style: ${style};`,
		'}',
	].join('\n');
}

/** Генерация _fonts-faces.scss по .woff2 файлам в public/assets/fonts/ */
function generateFontsFaces(fontsFiles) {
	const blocks = [];

	for (const file of fontsFiles) {
		const fontFileName = file.slice(0, -'.woff2'.length);
		const fontName = fontFileName.split('-')[0] || fontFileName;
		const vFont = fontFileName.split('-')[1] || fontFileName;

		if (
			vFont.toLowerCase() === 'variablefont' ||
			vFont.toLowerCase() === 'vf'
		) {
			blocks.push(variableFontFace(fontName, file));
			continue;
		}

		const weight = fontFileName.split('-')[1]
			? resolveWeight(fontFileName.split('-')[1])
			: 400;
		const style = fontFileName.split('-')[2]
			? resolveStyle(fontFileName.split('-')[2])
			: 'normal';
		blocks.push(staticFontFace(fontName, file, weight, style));
	}

	if (blocks.length === 0) return false;

	fs.mkdirSync(path.dirname(fontsFaces), { recursive: true });
	fs.writeFileSync(fontsFaces, `${blocks.join('\n\n')}\n`, 'utf-8');
	return true;
}

/** Конвертация всех .ttf из src/assets/fonts/ в .woff2 в public/assets/fonts/ */
function convertFonts() {
	if (!fs.existsSync(sourceDir)) {
		console.log('❌ Директория со шрифтами не найдена:', sourceDir);
		return;
	}

	const files = fs
		.readdirSync(sourceDir)
		.filter(f => f.toLowerCase().endsWith('.ttf'));

	if (files.length === 0) {
		console.log('⚠️ TTF файлы не найдены в:', sourceDir);
		return;
	}

	fs.mkdirSync(fontsDir, { recursive: true });

	for (const file of files) {
		const ttfPath = path.join(sourceDir, file);
		const woff2Name = file.replace(/\.ttf$/i, '.woff2');
		const woff2Path = path.join(fontsDir, woff2Name);

		if (
			fs.existsSync(woff2Path) &&
			fs.statSync(ttfPath).mtimeMs <= fs.statSync(woff2Path).mtimeMs
		) {
			console.log(`⏳ ${file} — актуален (${woff2Name})`);
			continue;
		}

		try {
			const output = ttf2woff2(fs.readFileSync(ttfPath));
			fs.writeFileSync(woff2Path, output);
			console.log(`✅ ${file} → ${woff2Name}`);
		} catch (err) {
			console.error(`❌ Ошибка конвертации ${file}:`, err.message);
		}
	}

	if (fs.existsSync(fontsDir)) {
		const fontsFiles = fs
			.readdirSync(fontsDir)
			.filter(f => f.toLowerCase().endsWith('.woff2'));
		try {
			if (generateFontsFaces(fontsFiles)) {
				console.log(`✅ _fonts-faces.scss сгенерирован: ${fontsFaces}`);
			} else {
				console.log('⚠️ Нет .woff2 файлов — _fonts-faces.scss не обновлён');
			}
		} catch (err) {
			console.error('❌ Ошибка генерации _fonts-faces.scss:', err.message);
		}
	}
}

convertFonts();
