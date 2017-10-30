<?php

include('php/jsonRPCClient.php');
include('php/EasyBitcoin-PHP.php');


$bitcoin = new Bitcoin('potcoinrpc','2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ','138.197.151.169','42000');
var_dump($bitcoin);
var_dump($bitcoin->getinfo());


die;

$bitcoin = new jsonRPCClient('http://potcoinrpc:2Mdo2p2m4DkdeSNvvtSKjxBinnmKRYib1hdWdWJcBqZQ@138.197.151.169:42000/', true);
var_dump($bitcoin);
var_dump($bitcoin->getinfo());
