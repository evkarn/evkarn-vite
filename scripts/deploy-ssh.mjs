// Выгрузка готовой сборки из dist на сервер по SSH (SFTP).
//
// Запуск: npm run deploy:ssh (предварительно сама соберёт проект).
// Данные подключения — в .env (шаблон: .env.example).
// Требуется настроенный ssh-доступ: по паролю (SSH_PASSWORD), ключу
// (SSH_PRIVATE_KEY_PATH) или ssh-agent (когда ни пароль, ни ключ не заданы).

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeSSH } from 'node-ssh';

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
);
const buildFolder = path.join(rootDir, 'dist');

const {
	SSH_HOST: host,
	SSH_USER: username,
	SSH_DESTINATION: destination,
} = process.env;

if (!host || !username || !destination) {
	console.error(
		'[deploy:ssh] Не заданы SSH_HOST, SSH_USER или SSH_DESTINATION. ' +
			'Скопируйте .env.example в .env и заполните данные подключения.',
	);
	process.exit(1);
}

if (!fs.existsSync(buildFolder)) {
	console.error(
		`[deploy:ssh] Нет папки dist (${buildFolder}). Сначала соберите проект: npm run build`,
	);
	process.exit(1);
}

const ssh = new NodeSSH();

try {
	const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH;
	await ssh.connect({
		host,
		username,
		port: Number(process.env.SSH_PORT) || 22,
		password: process.env.SSH_PASSWORD,
		// node-ssh умеет и читать файл ключа, и принимать содержимое;
		// если ни ключа, ни пароля нет — использует ssh-agent.
		privateKeyPath: privateKeyPath || undefined,
		privateKey: privateKeyPath ? undefined : process.env.SSH_PRIVATE_KEY,
	});

	let uploaded = 0;
	const ok = await ssh.putDirectory(buildFolder, destination, {
		recursive: true,
		concurrency: Number(process.env.SSH_PARALLEL) || 5,
		tick: (localPath, remotePath, error) => {
			if (error) console.error(`    ${remotePath}: ${error.message}`);
			else uploaded++;
		},
	});

	if (!ok) {
		console.error(
			'[deploy:ssh] Выгрузка завершилась неполностью (см. лог выше).',
		);
		process.exitCode = 1;
	} else {
		console.log(
			`[deploy:ssh] Готово: ${uploaded} файлов -> ${username}@${host}:${destination}`,
		);
	}
} catch (err) {
	console.error(`[deploy:ssh] Ошибка: ${err.message}`);
	process.exitCode = 1;
} finally {
	ssh.dispose();
}
