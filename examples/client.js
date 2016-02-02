var request = require('request');
var bitauth = require('..'); // or require('bitauth');

// These can be generated with bitauth.generateSin()
var keys = {
  alice: '38f93bdda21a5c4a7bae4eb75bb7811cbc3eb627176805c1009ff2099263c6ad',
  bob: '09880c962437080d72f72c8c63a69efd65d086c9e7851a87b76373eb6ce9aab5'
};

// GET

for (var k in keys) {
  var url = 'http://localhost:3000/user';
  var dataToSign = url;
  var options = {
    url: url,
    headers: {
      'x-identity': bitauth.getPublicKeyFromPrivateKey(keys[k]),
      'x-signature': bitauth.sign(dataToSign, keys[k])
    }
  };

  request.get(options, function (err, response, body) {
    console.log(err !== null ? err : body);
  });
}

var pizzas = ['pepperoni', 'sausage', 'veggie', 'hawaiian'];

// POST

for (k in keys) {
  url = 'http://localhost:3000/pizzas';
  var data = {type: pizzas[Math.floor(Math.random() * pizzas.length)]};
  dataToSign = url + JSON.stringify(data);
  options = {
    url: url,
    headers: {
      'x-identity': bitauth.getPublicKeyFromPrivateKey(keys[k]),
      'x-signature': bitauth.sign(dataToSign, keys[k])
    },
    json: data
  };

  request.post(options, function (err, response, body) {
    console.log(err !== null ? err : body);
  });
}
