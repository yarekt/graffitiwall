<?php
$file_handle = fopen('pointsData.log','r');
$image = '';
while ($buffer = fgets($file_handle)) {
    $image = $buffer;
}
fclose($file_handle);
header('Content-Type: image/png');
echo file_get_contents(trim($image));