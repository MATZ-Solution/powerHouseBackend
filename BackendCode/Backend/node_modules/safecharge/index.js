/* jshint plusplus: false */
/* vim: set et sts=0 ts=2 sw=2: */

var qs = require('querystring');
var crypto = require('crypto');

function pad(n) {
  return ('0' + n).slice(-2);
}

module.exports.getPPPURL = function _getPPPURL(items, options, secret) {
  items = items || [];
  options = options || {};
  secret = secret || process.env.SAFECHARGE_SECRET;
  var defaults = {
    merchant_id: process.env.SAFECHARGE_MERCHANT_ID,
    merchant_site_id: process.env.SAFECHARGE_MERCHANT_SITE_ID,
    currency: 'USD',
    version: '3.0.0',
    handling: 0,
    shipping: 0,
    discount: 0,
    total_tax: 0,
  };

  Object.keys(defaults).forEach(function(key) {
    if(options[key] === undefined) {
      options[key] = defaults[key];
    }
  });

  options.time_stamp = options.time_stamp || (function() {
    var now = new Date();
    return [
      [now.getFullYear(), pad(now.getMonth()+1), pad(now.getDate())].join('-'),
      [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(':')
    ].join('.');
  }());

  options.total_amount = options.total_amount || items.reduce(function(sum, item) {
    var amount   = item.amount,
        discount = item.discount || 0,
        shipping = item.shipping || 0,
        handling = item.handling || 0,
        quantity = item.quantity || 1;
    return sum + (amount - discount + shipping + handling) * quantity;
  }, options.shipping + options.handling - options.discount) * (1 + options.total_tax/100);

  items.forEach(function(item, index) {
    index++;
    Object.keys(item).forEach(function(key) {
      options['item_' + key + '_' + index] = item[key];
    });
  });

  options.checksum = (function() {
    var hash = crypto.createHash('md5');
    var data = [secret, options.merchant_id, options.currency, options.total_amount]
      .concat(
        items.map(function(item) {
          return [item.name, item.amount, item.quantity].join('');
        }))
      .concat([options.time_stamp]).join('');
    hash.update(data);
    return hash.digest('hex');
  }());

  return (options.url || 'https://secure.safecharge.com/ppp/purchase.do?')
         + qs.stringify(options);
};

module.exports.validate = function _validate(checksum, response, secret) {
  secret = secret || process.env.SAFECHARGE_SECRET;
  var hash = crypto.createHash('md5');
  var data = [secret, response.totalAmount, response.currency, response.responseTimeStamp, response.PPP_TransactionID, response.Status, response.productId].join('');
  hash.update(data);
  return checksum == hash.digest('hex');
};
