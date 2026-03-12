<?php

header("Content-Type: application/json; charset=utf-8");

$config = require __DIR__ . "/config.php";
$Keys = $config["keys"] ?? [];

if (!is_array($Keys) || count($Keys) === 0) {
    http_response_code(500);
    echo json_encode([
        "error" => [
            "message" => "Keys пустой. Добавь хотя бы 1 ключ."
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents("php://input");

if (!$rawBody) {
    http_response_code(400);
    echo json_encode([
        "error" => [
            "message" => "Empty body"
        ]
    ]);
    exit;
}

function isQuotaError($status, $responseText) {
    return (
        $status == 429 ||
        $status == 403 ||
        preg_match('/quota|rate|limit|leaked|exceed|RESOURCE_EXHAUSTED/i', $responseText)
    );
}

$geminiKeyIndex = 0;
$lastQuotaMessage = "";

for ($attempt = 0; $attempt < count($Keys); $attempt++) {

    $key = $Keys[$geminiKeyIndex];

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" . urlencode($key);

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => $rawBody,
        CURLOPT_TIMEOUT => 60
    ]);

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false) {
        http_response_code(500);
        echo json_encode([
            "error" => [
                "message" => "Curl error"
            ]
        ]);
        exit;
    }

    if ($status >= 200 && $status < 300) {
        echo $response;
        exit;
    }

    if (isQuotaError($status, $response)) {
        $lastQuotaMessage = $response;
        $geminiKeyIndex = ($geminiKeyIndex + 1) % count($Keys);
        continue;
    }

    http_response_code($status);
    echo $response;
    exit;
}

http_response_code(429);

echo json_encode([
    "error" => [
        "message" => "All keys exhausted",
        "details" => $lastQuotaMessage
    ]
]);