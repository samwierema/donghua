<?php
if (PHP_SAPI !== 'cli') {
    exit;
}

$json = file_get_contents('http://www.reddit.com/r/gifs/hot.json?sort=hot');
if ($http_response_header[0] !== 'HTTP/1.0 200 OK') {
    exit;
}

$parsed_json = json_decode($json, true);
if (empty($parsed_json) || !isset($parsed_json['data']['children']) || !is_array($parsed_json['data']['children'])) {
    exit;
}

$valid_urls = array();
if (file_exists(__DIR__ .'/gifs')) {
    $content = file_get_contents(__DIR__ .'/gifs');
    $valid_urls = explode(',', $content);
}

foreach ($parsed_json['data']['children'] as $result) {
    if (mb_strpos($result['data']['url'], 'imgur.com') !== false) {
        if (end(explode('.', $result['data']['url'])) !== 'gif') {
            $parsed_url = parse_url($result['data']['url']);
            if (count(explode('/', $parsed_url['path'])) > 2) {
                continue;
            }
            $result['data']['url'] = $parsed_url['scheme'] .'://i.'. $parsed_url['host'] . $parsed_url['path'] .'.gif';
        }
        $matched = false;
        foreach ($valid_urls as $valid_url) {
            if ($result['data']['url'] === $valid_url) {
                $matched = true;
                break;
            }
        }
        if (!$matched) {
            echo 'Adding '. $result['data']['url'] . PHP_EOL;
            $valid_urls[] = $result['data']['url'];
        }
    }
}

shuffle($valid_urls);

$valid_urls = array_slice($valid_urls, 0, 50);

file_put_contents(__DIR__ .'/gifs', implode(',', $valid_urls));
?>