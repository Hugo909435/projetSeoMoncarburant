<?php
declare(strict_types=1);

// Collecte des inscriptions newsletter (aucun envoi de newsletter pour l'instant).
// Chaque inscription est :
//  1. ajoutée à un CSV stocké HORS du document root : le déploiement fait un
//     "mirror --delete" de dist/ vers public_html, tout fichier écrit dans le
//     site serait donc effacé au déploiement suivant ;
//  2. notifiée par mail (NEWSLETTER_TO), trace de secours si le CSV est inaccessible.

const NEWSLETTER_TO = 'hugo.beignon@gmail.com';
const NEWSLETTER_FROM = 'contact@mon-carburant.com';

function respond(bool $success, int $status = 200, array $payload = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => $success] + $payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $name): string
{
    return trim(str_replace(["\r", "\n"], ' ', (string) ($_POST[$name] ?? '')));
}

function data_dir(): ?string
{
    // Parent du document root (ex. domains/mon-carburant.com/), non servi par le web.
    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'newsletter-data';

    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return null;
    }

    return is_writable($dir) ? $dir : null;
}

function is_rate_limited(): bool
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mon-carburant-newsletter';

    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }

    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $now = time();

    if (is_file($file) && ($now - (int) filemtime($file)) < 30) {
        return true;
    }

    @touch($file, $now);
    return false;
}

function already_subscribed(string $csv, string $email): bool
{
    $handle = @fopen($csv, 'r');
    if ($handle === false) {
        return false;
    }

    while (($row = fgetcsv($handle)) !== false) {
        if (isset($row[1]) && strtolower($row[1]) === $email) {
            fclose($handle);
            return true;
        }
    }

    fclose($handle);
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 405, ['message' => 'Method not allowed']);
}

// Pot de miel : un humain ne remplit jamais ce champ caché.
if (field('website') !== '') {
    respond(true);
}

$email = strtolower(field('email'));
$source = substr(field('source'), 0, 200);

if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 422, ['message' => 'Adresse email invalide.']);
}

if (is_rate_limited()) {
    respond(false, 429, ['message' => 'Merci de patienter quelques secondes.']);
}

$date = date('c');
$dir = data_dir();
$stored = false;
$duplicate = false;

if ($dir !== null) {
    $csv = $dir . DIRECTORY_SEPARATOR . 'inscriptions.csv';
    $duplicate = already_subscribed($csv, $email);

    if (!$duplicate) {
        $isNew = !is_file($csv);
        $handle = @fopen($csv, 'a');
        if ($handle !== false) {
            flock($handle, LOCK_EX);
            if ($isNew) {
                fputcsv($handle, ['date', 'email', 'page']);
            }
            fputcsv($handle, [$date, $email, $source]);
            flock($handle, LOCK_UN);
            fclose($handle);
            $stored = true;
        }
    }
}

// Pas de mail pour un doublon : l'adresse est déjà dans le CSV.
if (!$duplicate) {
    $body = "Nouvelle inscription newsletter.\n\nEmail : {$email}\nPage : {$source}\nDate : {$date}\n"
        . 'Stockage CSV : ' . ($stored ? 'ok' : 'ECHEC (garder ce mail)') . "\n";

    $headers = [
        'From: Mon Carburant <' . NEWSLETTER_FROM . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'MIME-Version: 1.0',
    ];

    $mailed = @mail(
        NEWSLETTER_TO,
        '=?UTF-8?B?' . base64_encode('[Mon Carburant] Inscription newsletter') . '?=',
        $body,
        implode("\r\n", $headers),
        '-f ' . NEWSLETTER_FROM
    );

    if (!$stored && !$mailed) {
        respond(false, 500, ['message' => 'Inscription impossible pour le moment.']);
    }
}

respond(true, 200, ['message' => 'Merci, votre inscription est bien enregistrée.']);
