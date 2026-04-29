<?php
declare(strict_types=1);

const CONTACT_TO = 'contact@mon-carburant.com';
const CONTACT_FROM = 'contact@mon-carburant.com';
const CONTACT_REDIRECT = '/contact/';

function wants_json(): bool
{
    return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

function respond(bool $success, int $status = 200, array $payload = []): void
{
    http_response_code($status);

    if (wants_json()) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => $success] + $payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $state = $success ? 'success' : 'error';
    header('Location: ' . CONTACT_REDIRECT . '?contact=' . $state . '#contact-form', true, 303);
    exit;
}

function field(string $name): string
{
    return trim((string) ($_POST[$name] ?? ''));
}

function clean_header(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function throttle_key(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return hash('sha256', $ip);
}

function is_rate_limited(): bool
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mon-carburant-contact';

    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }

    $file = $dir . DIRECTORY_SEPARATOR . throttle_key();
    $now = time();

    if (is_file($file) && ($now - (int) filemtime($file)) < 60) {
        return true;
    }

    @touch($file, $now);
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 405, ['message' => 'Method not allowed']);
}

if (field('website') !== '') {
    respond(true);
}

$name = clean_header(field('name'));
$email = clean_header(field('email'));
$subject = field('subject');
$message = field('message');
$rgpdAccepted = isset($_POST['rgpd']);

$subjectLabels = [
    'question' => 'Question generale',
    'partenariat' => 'Partenariat editorial',
    'correction' => 'Signalement d erreur',
    'autre' => 'Autre demande',
];

$errors = [];

if (strlen($name) < 2 || strlen($name) > 100) {
    $errors['name'] = 'Nom invalide.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Email invalide.';
}

if (!array_key_exists($subject, $subjectLabels)) {
    $errors['subject'] = 'Sujet invalide.';
}

if (strlen($message) < 20 || strlen($message) > 2000) {
    $errors['message'] = 'Message invalide.';
}

if (!$rgpdAccepted) {
    $errors['rgpd'] = 'Consentement requis.';
}

if ($errors !== []) {
    respond(false, 422, ['errors' => $errors]);
}

if (is_rate_limited()) {
    respond(false, 429, ['message' => 'Merci de patienter avant de renvoyer un message.']);
}

$safeSubject = $subjectLabels[$subject];
$mailSubject = '[Mon Carburant] ' . $safeSubject . ' - ' . $name;
$encodedSubject = '=?UTF-8?B?' . base64_encode($mailSubject) . '?=';
$date = date('d/m/Y H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Non disponible';
$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Non disponible', 0, 300);

$body = <<<MAIL
Nouvelle demande envoyee depuis le formulaire de contact Mon Carburant.

Nom : {$name}
Email : {$email}
Sujet : {$safeSubject}
Date : {$date}
Adresse IP : {$ip}
Navigateur : {$userAgent}

Message :
{$message}

---
Repondez directement a cet email : le champ Reply-To contient l'adresse du visiteur.
MAIL;

$headers = [
    'From: Mon Carburant <' . CONTACT_FROM . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = @mail(
    CONTACT_TO,
    $encodedSubject,
    wordwrap($body, 78),
    implode("\r\n", $headers),
    '-f ' . CONTACT_FROM
);

respond($sent, $sent ? 200 : 500, [
    'message' => $sent ? 'Message envoye.' : 'Impossible d envoyer le message.',
]);
