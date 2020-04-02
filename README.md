BitAuth
=======

Passwordless authentication using Bitcoin cryptography

## Overview

BitAuth is a way to do secure, passwordless authentication using the cryptography
in Bitcoin. Instead of using a shared secret, the client signs each request using
a private key and the server checks to make sure the signature is valid and matches
the public key.

## Getting started

Install with Node.js:

```bash
npm install bitauth
```

## Advantages over other authentication mechanisms

* By signing each request, man in the middle attacks are impossible.
* A nonce is part of the data signed, which prevents replay attacks.
* The cryptography in Bitcoin is rock solid and is securing billions
 of dollars worth of bitcoins.
* It uses elliptic curve cryptography which performs much better than RSA.
* Because the private key is never revealed to the server, it does
not need to be exchanged between the server and client over a side channel like
in HMAC.

## Technical Overview
BitAuth uses the same technology in Bitcoin. A public private key pair is created
using elliptic curve secp256k1. The public SIN (System identification number),
like a bitcoin address, is the RIPEMD 160, SHA256 hash of the public key.
See https://en.bitcoin.it/wiki/Identity_protocol_v1 for complete details.

In each request, the client includes a nonce to prevent replay attacks. The client
signs the full url with the request body concatenated if there is one. The signature
is included in the `x-signature` header and the public key is included in the
`x-identity` header.

The server verifies that the signature is valid and that it matches the identity (the public key).
It then computes the SIN from the public key, and sees whether that SIN has access
to the requested resource. The nonce is checked to make sure it is higher than
the previously used nonce.

## Technology is readily available

With the growing popularity of Bitcoin, there are already libraries written in
many languages. Because BitAuth uses the same technology as Bitcoin, it is easy
to start using BitAuth.


## Problems with password authentication

* Have to keep track of a separate password for every web service. People forget
passwords, encouraging them to reuse passwords and opening themselves up to
having multiple services compromised.
* Brute force attacks on weak passwords.
* Passwords may travel over plaintext
* Passwords in databases being leaked
* Phishing attacks to steal passwords

## Passwordless based authentication across web services

With BitAuth, users can use the same, strong password to encrypt their keys and
not worry about one service gaining access to another.

In the future, an identity system could be built around BitAuth keys where a user
could create one key to represent an identity which could authenticate against
multiple services.

In order for this to work, there would have to be a browser
integration or plugin which would manage these identities and a Javascript API
where websites could sign requests going to their website with the private key,
but without exposing the private key to the third party sites.

There also needs to be a public place to store SIN's, preferably in
a decentralized blockchain or datastore like namecoin. Key revocations could
be stored here as well as reviews/feedback to build a reputation around an
identity.

## Examples

Example server

```javascript
var express = require('express');
var bodyParser = require('body-parser');
var rawBody = require('../lib/middleware/rawbody');
var bitauth = require('../lib/middleware/bitauth');

var users = {
  'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz': {name: 'Alice'},
  'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2': {name: 'Bob'}
};

var pizzas = [];

var app = express();
app.use(rawBody);
app.use(bodyParser());


app.get('/user', bitauth, function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  res.send(200, users[req.sin]);
});

app.post('/pizzas', bitauth, function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  var pizza = req.body;
  pizza.owner = users[req.sin].name;
  pizzas.push(pizza);
  res.send(200, req.body);
});

app.get('/pizzas', function(req, res) {
  res.send(200, pizzas);
});

app.listen(3000);
```

Example client

```javascript
var request = require('request');
var bitauth = require('../lib/bitauth');

// These can be generated with bitauth.generateSin()
var keys = {
  alice: '38f93bdda21a5c4a7bae4eb75bb7811cbc3eb627176805c1009ff2099263c6ad',
  bob: '09880c962437080d72f72c8c63a69efd65d086c9e7851a87b76373eb6ce9aab5'
};

// GET

for(k in keys) {
  var url = 'http://localhost:3000/user';
  var dataToSign = url;
  var options = {
    url: url,
    headers: {
      'x-identity': bitauth.getPublicKeyFromPrivateKey(keys[k]),
      'x-signature': bitauth.sign(dataToSign, keys[k])
    }
  };

  request.get(options, function(err, response, body) {
    if(err) {
      console.log(err);
    }
    if(body) {
      console.log(body);
    }
  });
}

var pizzas = ['pepperoni', 'sausage', 'veggie', 'hawaiian'];

// POST

for(k in keys) {
  var url = 'http://localhost:3000/pizzas';
  var data = {type: pizzas[Math.floor(Math.random() * pizzas.length)]};
  var dataToSign = url + JSON.stringify(data);
  var options = {
    url: url,
    headers: {
      'x-identity': bitauth.getPublicKeyFromPrivateKey(keys[k]),
      'x-signature': bitauth.sign(dataToSign, keys[k])
    },
    json: data
  };

  request.post(options, function(err, response, body) {
    if(err) {
      console.log(err);
    }
    if(body) {
      console.log(body);
    }
  });
}

```

## Middleware
BitAuth exposes a connect middleware for use in connect or ExpressJS applications.  Use:
```javascript
var bitauth = require('bitauth');
app.use( bitauth.middleware );
```
