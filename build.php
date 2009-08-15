<?php
$time = microtime(true);
$cl = '
/** HTML5 sessionStorage
 * @build       '.gmdate('Y-m-d H:i:s').'
 * @author      Andrea Giammarchi
 * @license     Mit Style License
 * @project     http://code.google.com/p/sessionstorage/
 */
';
$name = 'sessionstorage';
$munge = true;
$output = array(
    'intro',
    'RC4',
    'LSS',
    'sessionStorage',
    'outro'
);
// -- simple build
$file = 'build/'.$name.'.js';
$filemin = str_replace('.js', '.min.js', $file);
if(!function_exists('file_put_contents')){
    function file_put_contents($file, $content){
        $fp = fopen($file, 'wb');
        fwrite($fp, $content);
        fclose($fp);
    }
}
$nl = "\r\n";
foreach($output as $key => $value)
    $output[$key] = file_get_contents('src/'.$value.'.js');
$output = implode($nl.$nl, $output);
$output = ($cl=trim($cl)).$nl.$nl.$output;
if(file_exists($file))
    unlink($file);
if(file_exists($filemin))
    unlink($filemin);
file_put_contents($file, $output);
exec('java -jar yuicompressor-2.4.2.jar '.($munge ? '' : '--nomunge').' '.$file.' -o '.$filemin);
$min = $cl.file_get_contents($filemin);
file_put_contents($filemin, $min);
ob_start('ob_gzhandler');
header('Content-Type: text/javascript');
header('X-Served-In: '.(microtime(true) - $time));
exit($min);
?>