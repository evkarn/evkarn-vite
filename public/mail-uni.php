<?php
// Подключение PHPMailer
require './assets/files/php-mailer/PHPMailer.php';
require './assets/files/php-mailer/SMTP.php';
require './assets/files/php-mailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Подключение конфигурации SMTP (переменные $smtpHost, $fromName и др. берутся отсюда)
require '../config.php';

// Заголовок JSON-ответа
header('Content-Type: application/json; charset=utf-8');

// Проверка: только AJAX запросы
if (
	$_SERVER['REQUEST_METHOD'] !== 'POST' ||
	!isset($_SERVER['HTTP_X_REQUESTED_WITH']) ||
	strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest'
) {
	http_response_code(403);
	echo json_encode(['success' => false, 'message' => 'Доступ запрещён']);
	exit;
}

// Универсальная санитизация входных данных
function sanitize($data)
{
	if (is_array($data)) {
		return implode(', ', array_map('sanitize', $data));
	}
	return htmlspecialchars(trim((string)$data), ENT_QUOTES, 'UTF-8');
}

// Проверка, что POST-запрос не пустой
if (empty($_POST) && empty($_FILES)) {
	echo json_encode(['success' => false, 'message' => 'Нет данных для отправки']);
	exit;
}

// Настройки безопасной загрузки файлов
$maxFileSize = 5 * 1024 * 1024; // Максимальный размер: 5 МБ
$allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'zip', 'txt', 'webp'];
$attachedFilesInfo = []; // Для красивого вывода имен в теле письма
$validFilesForAttachment = []; // Для реальной передачи в PHPMailer

// Предварительная валидация загруженных файлов
if (!empty($_FILES)) {
	foreach ($_FILES as $fieldName => $fileData) {
		// Поддержка множественной загрузки (когда в HTML есть multiple)
		if (is_array($fileData['name'])) {
			$fileCount = count($fileData['name']);
			for ($i = 0; $i < $fileCount; $i++) {
				if ($fileData['error'][$i] === UPLOAD_ERR_OK) {
					$tmpName = $fileData['tmp_name'][$i];
					$originalName = $fileData['name'][$i];
					$size = $fileData['size'][$i];

					if ($size <= $maxFileSize && is_uploaded_file($tmpName)) {
						$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
						if (in_array($ext, $allowedExtensions, true)) {
							$attachedFilesInfo[] = sanitize($originalName);
							$validFilesForAttachment[] = ['tmp' => $tmpName, 'name' => sanitize($originalName)];
						}
					}
				}
			}
		} else {
			// Поддержка одиночного файла
			if ($fileData['error'] === UPLOAD_ERR_OK) {
				$tmpName = $fileData['tmp_name'];
				$originalName = $fileData['name'];
				$size = $fileData['size'];

				if ($size <= $maxFileSize && is_uploaded_file($tmpName)) {
					$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
					if (in_array($ext, $allowedExtensions, true)) {
						$attachedFilesInfo[] = sanitize($originalName);
						$validFilesForAttachment[] = ['tmp' => $tmpName, 'name' => sanitize($originalName)];
					}
				}
			}
		}
	}
}

// Динамическое формирование тела письма
$title = "Новая заявка с сайта ({$fromName})";
$body = "<h3>Новая заявка с сайта ({$fromName})</h3>";
$body .= "<ul style='list-style: none; padding: 0; margin: 0;'>";

foreach ($_POST as $key => $value) {
	$safeKey = sanitize($key);
	$safeValue = sanitize($value);

	if ($safeValue !== '') {
		$formattedKey = mb_convert_case(str_replace('_', ' ', $safeKey), MB_CASE_TITLE, "UTF-8");
		$body .= "<li style='margin-bottom: 8px;'><b>{$formattedKey}:</b> {$safeValue}</li>";
	}
}

// Добавление информации о файлах в тело письма, если они прошли валидацию
if (!empty($attachedFilesInfo)) {
	$body .= "<li style='margin-bottom: 8px;'><b>📎 Прикрепленные файлы:</b> " . implode(', ', $attachedFilesInfo) . "</li>";
}

$body .= "</ul>";
$body .= "<br>";
$body .= "<p><small>Отправлено: " . date('d.m.Y H:i:s') . " | IP: " . sanitize($_SERVER['REMOTE_ADDR'] ?? 'Не определен') . "</small></p>";

// Инициализация и отправка
$mail = new PHPMailer(true);

try {
	$mail->isSMTP();
	$mail->CharSet = "UTF-8";
	$mail->SMTPAuth = true;

	$mail->Host       = $smtpHost;
	$mail->Username   = $smtpUser;
	$mail->Password   = $smtpPass;
	$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
	$mail->Port       = $smtpPort;

	$mail->setFrom($fromEmail, $fromName);
	$mail->addAddress($recipient);

	// Добавление проверенных файлов в письмо
	foreach ($validFilesForAttachment as $file) {
		$mail->addAttachment($file['tmp'], $file['name']);
	}

	$mail->isHTML(true);
	$mail->Subject = $title;
	$mail->Body    = $body;

	$mail->send();

	echo json_encode(['success' => true, 'message' => 'Успешно']);
} catch (Exception $e) {
	error_log("[{$fromName}] Mailer Error: {$mail->ErrorInfo}");

	http_response_code(500);
	echo json_encode([
		'success' => false,
		'message' => 'Ошибка отправки. Попробуйте позже.'
	]);
}
