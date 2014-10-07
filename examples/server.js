var express = require('express');
var bodyParser = require('body-parser');
var rawBody = require('../lib/middleware/rawbody');
var bitauth = require('../lib/middleware/bitauth');

var users = {
  'Tf7Rm1ETjHRiUWZoJTXwVA3nXEQiih35vp3': {name: 'Alice'},
  'TexKrSDV87wMhVzTUda5gz92L2joMuwo17m': {name: 'Bob'}
};

var pizzas = [];

var app = express();
app.use(rawBody);
app.use(bodyParser.raw());

app.get('/user', bitauth, function(req, res) {
  console.log('req.identity' , req.identity);
  
  if(!req.identity || !users[req.identity]) return res.send(401, {error: 'Unauthorized'});
  res.send(200, users[req.identity]);
});

app.post('/pizzas', bitauth, function(req, res) {
  if(!req.identity || !users[req.identity]) return res.send(401, {error: 'Unauthorized'});
  var pizza = req.body;
  pizza.owner = users[req.identity].name;
  pizzas.push(pizza);
  res.send(200, req.body);
});

app.get('/pizzas', function(req, res) {
  res.send(200, pizzas);
});

app.listen(3000);
