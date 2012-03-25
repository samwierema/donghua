<?php
if (PHP_SAPI !== 'cli') {
    exit;
}

if (!file_exists(__DIR__ .'/gifs')) {
    exit;
}

$content = file_get_contents(__DIR__ .'/gifs');
if (empty($content)) {
    exit;
}

$urls = explode(',', $content);
if (empty($urls)) {
    exit;
}

$echonest_url = 'http://developer.echonest.com/api/v4/song/search?api_key=JE5HC1XA1JNMFKH3K&format=json&results=1&bucket=id:spotify-WW&limit=true&bucket=tracks&sort=artist_familiarity-desc';

$playable_gifs = array();

foreach ($urls as $url) {
    exec('identify -verbose '. $url .' | grep "Delay" | cut -b 10-', $frames);
    if (empty($frames)) {
        continue;
    }
    $duration = 0;
    $total_ticks = 0;
    foreach ($frames as $frame) {
        list($ticks, $ticks_per_second) = explode('x', $frame);
        $total_ticks += $ticks;
    }
    if ($ticks_per_second == 100) {
        $duration = ($total_ticks / 100);
        $min_tempo = $max_tempo = number_format((60 / ($duration / 4)), 1, '.', '');
    } else {
        // Still to do
    }
    unset($frames);
    
    $track = '';
    
    $i = 0;
    while ($i < 5) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $echonest_url .'&min_tempo='. $min_tempo .'&max_tempo='. $max_tempo);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        if (empty($result)) {
            break;
        }
        $result = json_decode($result, true);
        if (empty($result['response']['songs'])) {
            $min_tempo = ($min_tempo / 2);
            $max_tempo = ($max_tempo * 2);
            $i++;
            usleep(500000);
            continue;
        }
        $track = $result['response']['songs'][0]['tracks'][0]['foreign_id'];
        break;
    }
    
    if (empty($track)) {
        continue;
    }
    
    $playable_gifs[] = array(
        'gif' => $url,
        'track_id' => 'spotify'. mb_substr($track, 10)
    );
    echo $url .' => '. 'spotify'. mb_substr($track, 10) . PHP_EOL;
}

if (empty($playable_gifs)) {
    exit;
}

file_put_contents(__DIR__ .'/gifs.json', json_encode($playable_gifs));
?>