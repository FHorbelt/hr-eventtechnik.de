<?php
// contact.php - Speichern Sie diese Datei im Hauptverzeichnis Ihrer Website

// Nur POST-Anfragen erlauben
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Nur POST-Anfragen erlaubt']);
    exit;
}

// CORS-Headers für AJAX-Anfragen
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Konfiguration - Diese Werte Anpassen!
$empfaenger_email = "HR-Eventtechnik@web.de";
$empfaenger_name = "H&R Eventtechnik";
$betreff_prefix = "[Website Anfrage]";

// Funktion zum sicheren Bereinigen der Eingaben
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Eingabedaten auslesen und bereinigen
$name = sanitizeInput($_POST['name'] ?? '');
$email = sanitizeInput($_POST['email'] ?? '');
$phone = sanitizeInput($_POST['phone'] ?? '');
$subject = sanitizeInput($_POST['subject'] ?? 'Allgemeine Anfrage');
$message = sanitizeInput($_POST['message'] ?? '');

// Konfigurator-Daten (wenn vorhanden)
$products = $_POST['products'] ?? [];
$serviceOptions = $_POST['serviceOptions'] ?? [];
$totalPrice = $_POST['totalPrice'] ?? 0;
$eventDate = sanitizeInput($_POST['event-date'] ?? '');
$eventType = sanitizeInput($_POST['event-type'] ?? '');
$eventLocation = sanitizeInput($_POST['event-location'] ?? '');
$guestCount = sanitizeInput($_POST['guest-count'] ?? '');
$eventDuration = sanitizeInput($_POST['event-duration'] ?? '');
$additionalInfo = sanitizeInput($_POST['additional-info'] ?? '');

// Validierung
$errors = [];

if (empty($name)) {
    $errors[] = "Name ist erforderlich";
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Gültige E-Mail-Adresse ist erforderlich";
}

if (empty($message) && empty($products)) {
    $errors[] = "Nachricht oder Produktauswahl ist erforderlich";
}

// Bei Fehlern: Fehler zurückgeben
if (!empty($errors)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Validierungsfehler: ' . implode(', ', $errors)
    ]);
    exit;
}

// E-Mail-Inhalt erstellen
$email_subject = $betreff_prefix . " " . $subject . " von " . $name;

$email_body = "Neue Anfrage über die Website\n";
$email_body .= "=====================================\n\n";
$email_body .= "Kontaktdaten:\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "E-Mail: " . $email . "\n";
$email_body .= "Telefon: " . ($phone ?: 'Nicht angegeben') . "\n";
$email_body .= "Betreff: " . $subject . "\n\n";

if (!empty($message)) {
    $email_body .= "Nachricht:\n";
    $email_body .= $message . "\n\n";
}

// Konfigurator-Daten hinzufügen (wenn vorhanden)
if (!empty($products)) {
    $email_body .= "KONFIGURATOR-AUSWAHL:\n";
    $email_body .= "====================\n\n";
    
    if ($eventDate) {
        $email_body .= "Veranstaltungsdatum: " . date('d.m.Y', strtotime($eventDate)) . "\n";
    }
    if ($eventType) {
        $email_body .= "Art der Veranstaltung: " . $eventType . "\n";
    }
    if ($eventLocation) {
        $email_body .= "Ort: " . $eventLocation . "\n";
    }
    if ($guestCount) {
        $email_body .= "Anzahl Gäste: " . $guestCount . "\n";
    }
    if ($eventDuration) {
        $email_body .= "Dauer: " . $eventDuration . " Tag(e)\n";
    }
    $email_body .= "\n";
    
    $email_body .= "Gewünschte Produkte:\n";
    foreach ($products as $product) {
        $email_body .= "- " . $product['quantity'] . "x " . $product['name'] . " (" . $product['price'] . "€/Tag)\n";
    }
    $email_body .= "\n";
    
    if (!empty($serviceOptions)) {
        $email_body .= "Zusätzliche Services:\n";
        if (isset($serviceOptions['aufbau']) && $serviceOptions['aufbau']) {
            $email_body .= "- Auf- und Abbau\n";
        }
        if (isset($serviceOptions['mixing']) && $serviceOptions['mixing']) {
            $email_body .= "- Live Mixing\n";
        }
        $email_body .= "\n";
    }
    
    if ($totalPrice > 0) {
        $email_body .= "Gesamtpreis pro Tag: " . $totalPrice . "€\n";
        if ($eventDuration > 1) {
            $email_body .= "Gesamtpreis für " . $eventDuration . " Tag(e): " . ($totalPrice * $eventDuration) . "€\n";
        }
        $email_body .= "\n";
    }
}

if (!empty($additionalInfo)) {
    $email_body .= "Zusätzliche Informationen:\n";
    $email_body .= $additionalInfo . "\n\n";
}

$email_body .= "=====================================\n";
$email_body .= "Diese Anfrage wurde automatisch über die Website erstellt.\n";
$email_body .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "Zeitpunkt: " . date('d.m.Y H:i:s') . "\n";

// E-Mail-Headers
$headers = array();
$headers[] = "From: Website <noreply@hr-eventtechnik.de>";
$headers[] = "Reply-To: " . $name . " <" . $email . ">";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// E-Mail versenden
$success = mail($empfaenger_email, $email_subject, $email_body, implode("\r\n", $headers));

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns schnellstmöglich bei Ihnen.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Versenden der E-Mail. Bitte versuchen Sie es später erneut.'
    ]);
}
?>