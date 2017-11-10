var Wallet = (function() {
  'use strict';

  const bitcore = require('bitcore-lib');
  const explorers = require('bitcore-explorers');
  const mnemonic = require('bitcore-mnemonic');

  const maxAddresses = 100;
  var addresses = [];

  /**
   * Here lies all the secret... change this lines to make it work with any other altcoin.
   */
  var derivationPath = "m/44'/81'/0'/0";
  var blockchainUrl = 'https://chain.potcoin.com';
  var PotNet = {
    name: 'potcoin',
    alias: 'potcoin',
    pubkeyhash: 0x37, // 55
    privatekey: 0xB7, // 183 (wif)
    scripthash: 0x05, // 5
    xpubkey: 0x0488b21e,
    xprivkey: 0x0488ade4,
    port: 4200
  };

  function generateNemo() {
    var code = new mnemonic();// English words
    var nemo = code.toString();
    console.log(nemo);
    return nemo;
  }

  function generateHD(nemo, pass) {
    if (validatesNemo(nemo) === false) {
      throw new Error("Seed code is invalid");
    }

    var code = new mnemonic(nemo);
    console.log(code);
    var xpriv = code.toHDPrivateKey(pass);
    console.log(xpriv);
    var hdPrivateKey = new bitcore.HDPrivateKey(xpriv);
    console.log(hdPrivateKey);
    //var hdPublicKey = hdPrivateKey.hdPublicKey;
    //console.log(hdPublicKey); // kind of useless, since won't be used for derivation

    for (var i = 0; i < maxAddresses; i++) {
      var derived = hdPrivateKey.derive(derivationPath).derive(i);
      var address = new bitcore.Address(derived.publicKey).toString();
      var privatekey = derived.privateKey.toWIF();
      var balance = 0;
      addresses.push({address, privatekey, balance});
    }

    return addresses
  }

  /**
  * Validations
  */
  function validatesNemo(nemo) {
    if (typeof nemo !== 'undefined') {
      return mnemonic.isValid(nemo);
    }

    throw new Error("Where is the seed to validate?");
  }

  function validatesPriv(privKey) {
    if (typeof privKey !== 'undefined') {
      return bitcore.PrivateKey.isValid(privKey);
    }

    throw new Error("No private key provided");
  }

  function validatesPub(pubKey) {
    if (typeof pubKey !== 'undefined') {
      return bitcore.PublicKey.isValid(pubKey);
    }

    throw new Error("No public key provided");
  }

  function validatesAddress(address) {
    if (typeof address !== 'undefined') {
      return bitcore.Address.isValid(address);
    }

    throw new Error("No address provided");
  }

  // main init method
  function init() {
    var AltNet = new bitcore.Networks.add(PotNet);// Set potcoin network as default
    bitcore.Networks.defaultNetwork = AltNet;
  }

  /* =============== export public methods =============== */
  return {
    init: init,
    generateNemo: generateNemo,
    validatesNemo: validatesNemo, // Useful only with generateHD
    validatesPriv: validatesPriv, // Useful only to import
    validatesPub: validatesPub, // Kind of useless
    validatesAddress: validatesAddress,
    generateHD: generateHD,
    addresses: addresses,
  };
}());
