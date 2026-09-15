import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Standalone-скрипт (вне Vite): копирование статики в public/ (public отдаётся
// как есть в dev и копируется в dist сборкой.
//
//   src/assets/favicon/** → public/assets/favicon/
//   src/assets/files/**   → public/assets/files/
//   src/config/**         → public/            (robots.txt, .htaccess в корень)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const tasks = [
	{
		name: 'favicon',
		src: path.join(rootDir, 'src', 'assets', 'favicon'),
		dest: path.join(rootDir, 'public', 'assets', 'favicon'),
	},
	{
		name: 'files',
		src: path.join(rootDir, 'src', 'assets', 'files'),
		dest: path.join(rootDir, 'public', 'assets', 'files'),
	},
	{
		name: 'config',
		src: path.join(rootDir, 'src', 'config'),
		dest: path.join(rootDir, 'public'),
	},
];

/** Рекурсивный обход, включая dot-файлы (.htaccess) */
function walk(dir, callback) {
	if (!fs.existsSync(dir)) return;
	const dirents = fs.readdirSync(dir, { withFileTypes: true });
	for (const dirent of dirents) {
		const fullPath = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			walk(fullPath, callback);
		} else {
			callback(fullPath);
		}
	}
}

/** Абсолютный путь в dest по относительному пути в src */
function destFor(srcFile, srcDir, destDir) {
	const rel = path.relative(srcDir, srcFile);
	return path.join(destDir, rel);
}

let totalCopied = 0;
let totalSkipped = 0;

for (const task of tasks) {
	if (!fs.existsSync(task.src)) {
		console.log(`[copy-static] ${task.name}: нет исходников (${task.src})`);
		continue;
	}

	fs.mkdirSync(task.dest, { recursive: true });
	let taskCopied = 0;
	let taskSkipped = 0;

	walk(task.src, srcFile => {
		const destFile = destFor(srcFile, task.src, task.dest);

		if (
			fs.existsSync(destFile) &&
			fs.statSync(srcFile).mtimeMs <= fs.statSync(destFile).mtimeMs
		) {
			taskSkipped++;
			return;
		}

		fs.mkdirSync(path.dirname(destFile), { recursive: true });
		fs.copyFileSync(srcFile, destFile);
		taskCopied++;
	});

	totalCopied += taskCopied;
	totalSkipped += taskSkipped;
	console.log(
		`[copy-static] ${task.name}: скопировано ${taskCopied}, актуально ${taskSkipped} -> ${task.dest}/`,
	);
}

console.log(
	`[copy-static] итого: скопировано ${totalCopied}, актуально ${totalSkipped}`,
);
