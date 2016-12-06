var express = require('express');
var bodyParser = require('body-parser');
var rawBody = require('../lib/middleware/rawbody');
var bitauthMiddleware = require('../lib/middleware/bitauth');
var path = require('path')

var users = {
  'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz': {name: 'Alice'},
  'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2': {name: 'Bob'}
};

var pizzas = [];

var app = express();
app.use(rawBody);
app.use(bodyParser());

app.get('/user', bitauthMiddleware, function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  res.send(200, users[req.sin]);
});

app.post('/pizzas', bitauthMiddleware, function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  var pizza = req.body;
  pizza.owner = users[req.sin].name;
  pizzas.push(pizza);
  res.send(200, req.body);
});

app.get('/pizzas', function(req, res) {
  res.send(200, pizzas);
});

app.get('/', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'index.html'))
});

app.get('/bundle.js', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'bundle.js'))
});

var port = 3000;
app.listen(port, function() {
  console.log('Listening on http://localhost:' + port)
});
