var request = require('request');
var BitAuth = require('../lib/bitauth');
var bitauth = new BitAuth();

// These can be generated with bitauth.generateIdentity()
var keys = {
  alice: 'L1i9Xe5gVdg78Cc1U1aCUGG8ZjZ5qieL9axpmKxwjak8FFbSnfYQ',
  bob: 'KxpMscE4vhkdTbVHFDuWjYh73APHGATLy1ZndDdL5jCy5d9Kv166'
};

console.log('Alice:')
var alice = new BitAuth();
alice.generateIdentity();
console.log( alice._keypair.privkey.toString() );
console.log( alice._keypair.pubkey.toString() );
console.log( 'pubDER:' , alice._keypair.pubkey.toDER().toString('hex') );
console.log( alice._identity.toString() );

console.log('Bob:')
var bob = new BitAuth();
bob.generateIdentity();
console.log( bob._keypair.privkey.toString() );
console.log( bob._keypair.pubkey.toString() );
console.log( 'pubDER:' , bob._keypair.pubkey.toDER().toString('hex') );
console.log( bob._identity.toString() );

var keys = {
  alice: alice,
  bob: bob
}

console.log('keys', keys);

// GET

for(k in keys) {
  
  console.log( keys[k]._keypair.privkey )

  var url = 'http://localhost:3000/user';
  var dataToSign = url;
  var options = {
    url: url,
    headers: {
      'x-identity':  keys[k]._identity.toString() ,
      'x-signature': bitauth.sign( dataToSign , keys[k]._keypair )
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
      'x-identity': keys[k]._identity.toString(),
      'x-signature': bitauth.sign( dataToSign , keys[k]._keypair )
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
