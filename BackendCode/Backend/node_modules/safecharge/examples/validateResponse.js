var express = require('express');
var safecharge = require('../index.js');

var app = express();

app.get('/foo', function(req, res) {
  res.redirect(safecharge.getPPPURL([{
    name: 'foo',
    amount: 10,
  }], {
    success_url: 'http://localhost:3000/bar'
  }));
});

app.get('/bar', function(req, res) {
  var valid = safecharge.validate(req.param('advanceResponseChecksum'), {
    totalAmount: req.param('totalAmount'),
    currency: req.param('currency'),
    responseTimeStamp: req.param('responseTimeStamp'),
    PPP_TransactionID: req.param('PPP_TransactionID'),
    Status: req.param('Status'),
    productId: req.param('productId')
  });
  if(valid) {
    res.send('KTHXBYE');
  } else {
    res.send(':-(');
  }
  console.log(req.query);
});

app.listen(3000);
