<pre>
<?php

include 'php/jsonRPCClient.php';
include 'php/EasyBitcoin-PHP.php';

//$bitcoin = new Bitcoin('potcoinrpc', '2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ', '138.197.151.169', '42000');
//var_dump($bitcoin->sendrawtransaction('01000000017f85b7a328f0fc0a3a66e0864639189ac0a4873ea98be3d463c806217a7e0c5f0100000049483045022100da526a9275beddedeb6ce4ef9f105d8d7a68eda5df5e58eccbb8bc8f0169f22602205cd061e95199d9fbb854cc6f1ae3408e274747eda69a9be76050a0c47e8ff5f301ffffffff02401f0000000000001976a91461c652988f9ffe202e2fe640014a6296a491ff2488ac6b3fc01d000000001976a91486e276e2aaf23425fa413a8f67b16c75e17dcfd588ac00000000'));
//var_dump($bitcoin->getinfo());

$bitcoin = new jsonRPCClient('http://potcoinrpc:2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ@138.197.151.169:42000/', true);

$txraw = '01000000019a5a44c28acdfe1b360e565a3e3b396bc155525e40b333175775fca04fa073d9010000006a473044022045eda587f38461e391b93de220e26afb3e927d6473e6a3ae48e150ca3f992f120220292b1558facd07936ddd855c5377a9c193ef2cedf97fa67c0d32a9a5a15eb67f0121031e4d9fb58a451822fdf9b4fea0e22c33a685097a65a8e8760730dcb6929680e7ffffffff0250c30000000000001976a91452cfece0004d525df6c3d85295601a5b196ebaa988ac500a8700000000001976a9144d515dfc23e9a97de075309be0011ef7e44230d388ac00000000';
//print_r($bitcoin->decoderawtransaction($txraw));
print_r($bitcoin->sendrawtransaction($txraw));
var_dump($bitcoin->getinfo());
?>
</pre>
