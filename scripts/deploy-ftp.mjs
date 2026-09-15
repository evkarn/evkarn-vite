// Выгрузка готовой сборки из dist на FTP-сервер.
//
// Запуск: npm run deploy:ftp (предварительно сама соберёт проект).
// Данные подключения — в .env (шаблон: .env.example).

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import basicFTP from 'basic-ftp';

const { Client, FastTransferStrategy } = basicFTP;

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
);
const buildFolder = path.join(rootDir, 'dist');

const { FTP_HOST: host, FTP_USER: user, FTP_PASSWORD: password } = process.env;

const remotePath = process.env.FTP_REMOTE_PATH || path.basename(rootDir);
const parallel = Number(process.env.FTP_PARALLEL) || 5;

if (!host || !user || !password) {
	console.error(
		'[deploy:ftp] Не заданы FTP_HOST, FTP_USER или FTP_PASSWORD. ' +
			'Скопируйте .env.example в .env и заполните данные подключения.',
	);
	process.exit(1);
}

if (!fs.existsSync(buildFolder)) {
	console.error(
		`[deploy:ftp] Нет папки dist (${buildFolder}). Сначала соберите проект: npm run build`,
	);
	process.exit(1);
}

// Держим соединение при долгих операциях (по умолчанию 30 с)
const client = new Client(120000);
// FTPS включается FTP_SECURE=1 (напр. FTP_SECURE=explicit/1); по умолчанию — plain FTP
client.ftp.verbose = false;

try {
	await client.register(FastTransferStrategy, {
		concurrency: parallel,
		chunkSize: 128 * 1024,
	});

	await client.access({
		host,
		user,
		password,
		secure:
			process.env.FTP_SECURE === '1' || process.env.FTP_SECURE === 'explicit',
		secureOptions: { rejectUnauthorized: false },
	});

	console.log(
		`[deploy:ftp] Подключено: ${host} (потоков: ${parallel}), заливаю в ${remotePath}/`,
	);
	await client.uploadFromDir(buildFolder, remotePath);
	console.log('[deploy:ftp] Готово.');
} catch (err) {
	console.error(`[deploy:ftp] Ошибка: ${err.message}`);
	process.exitCode = 1;
} finally {
	client.close();
}
