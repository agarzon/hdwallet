<pre>
<?php

ini_set('xdebug.var_display_max_depth', 15);
ini_set('xdebug.var_display_max_children', 256);
ini_set('xdebug.var_display_max_data', 1024);

include 'php/jsonRPCClient.php';
//include 'php/EasyBitcoin-PHP.php';

//$bitcoin = new Bitcoin('potcoinrpc', '2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ', '138.197.151.169', '42000');
//var_dump($bitcoin->sendrawtransaction('01000000017f85b7a328f0fc0a3a66e0864639189ac0a4873ea98be3d463c806217a7e0c5f0100000049483045022100da526a9275beddedeb6ce4ef9f105d8d7a68eda5df5e58eccbb8bc8f0169f22602205cd061e95199d9fbb854cc6f1ae3408e274747eda69a9be76050a0c47e8ff5f301ffffffff02401f0000000000001976a91461c652988f9ffe202e2fe640014a6296a491ff2488ac6b3fc01d000000001976a91486e276e2aaf23425fa413a8f67b16c75e17dcfd588ac00000000'));
//var_dump($bitcoin->getinfo());

$bitcoin = new jsonRPCClient('http://potcoinrpc:2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ@138.197.151.169:42000/', true);
//var_dump($bitcoin->getinfo());

$utox = '[{"address":"PFdzfENGEYdfXn6S8AZvRSijKpHixautkq","txid":"6adad616d0c36488ec3dbbe3e601c60d4ac5d5e29123e43da1ce0d83f3b4839a","vout":0,"ts":1510174436,"scriptPubKey":"76a9144d515dfc23e9a97de075309be0011ef7e44230d388ac","amount":0.087,"confirmations":6,"confirmationsFromCache":true}]';
$json = json_decode($utox, true);

$destinations = [
    "PG93ec6KmpYKcssFPMW7jKV9uPcAw35SEE" => 0.01,
    "PFdzfENGEYdfXn6S8AZvRSijKpHixautkq" => 0.076
];

$txraw1 = $bitcoin->createrawtransaction($json, $destinations);
var_dump($txraw1);
$hex1 = $bitcoin->decoderawtransaction($txraw1);
var_dump($hex1);


$signed = $bitcoin->signrawtransaction($txraw1, $json, ["U7Wig5kPqXNN34dLN568hVk9sLsWxK1AbCdex1oRJwCsbFVxUM6K"]);
var_dump($signed);
$signedDeco = $bitcoin->decoderawtransaction($signed);
var_dump($signedDeco);

//var_dump($bitcoin->sendrawtransaction($txraw));
//var_dump($bitcoin->getreceivedbylabel());
?>
</pre>
