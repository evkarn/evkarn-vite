// Упаковка готовой сборки из dist в zip-архив в корне проекта.
//
// Запуск: npm run deploy:zip (предварительно сама соберёт проект — сборка
// уже зашита в npm-скрипт). Итоговый файл: <имя-папки-проекта>.zip

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZipArchive } from 'archiver';

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
);
const buildFolder = path.join(rootDir, 'dist');
const zipPath = path.join(rootDir, `${path.basename(rootDir)}.zip`);

if (!fs.existsSync(buildFolder)) {
	console.error(
		`[deploy:zip] Нет папки dist (${buildFolder}). Сначала соберите проект: npm run build`,
	);
	process.exit(1);
}

// Удаляем старый архив, чтобы в него не попали лишние файлы
// (await иного рода тут не нужен — rmSync синхронный).
fs.rmSync(zipPath, { force: true });

const output = fs.createWriteStream(zipPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => {
	const sizeKb = (archive.pointer() / 1024).toFixed(1);
	console.log(`[deploy:zip] Готово: ${zipPath} (${sizeKb} КБ)`);
});

archive.on('warning', err =>
	console.warn(`[deploy:zip] Предупреждение: ${err.message}`),
);
archive.on('error', err => {
	console.error(`[deploy:zip] Ошибка: ${err.message}`);
	process.exitCode = 1;
});

archive.pipe(output);
// { false }: содержимое dist ляжет в корень архива, без папки dist/
archive.directory(buildFolder, false);
await archive.finalize();
