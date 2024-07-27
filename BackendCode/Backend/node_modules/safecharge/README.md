# node-safecharge

This module generates URL-s for the Safecharge PPP, and validates responses.

## Install

```
$ npm install safecharge
```

## Usage

### getPPPURL(items, options, [secret])

Exapmple:

```js
safecharge.getPPPURL([{
  name: 'Foo',
  amount: 19.95
}], {
  merchant_id: 'XXX',
  merchant_site_id: 'YYY',
}, 'ZZZ');
//https://secure.safecharge.com/ppp/purchase.do?merchant_id=XXX&merchant_site_id=YYY&currency=USD&version=3.0.0&handling=0&shipping=0&discount=0&total_tax=0&time_stamp=2013-10-03.15%3A23%3A03&total_amount=19.95&item_name_1=Foo&item_amount_1=19.95&checksum=6c514a07da49485e009aedbc99194262
```

The following default values are used:

```
secret: process.env.SAFECHARGE_SECRET
merchant_id: process.env.SAFECHARGE_MERCHANT_ID
merchant_site_id: process.env.SAFECHARGE_MERCHANT_SITE_ID
curreny: 'USD'
version: '3.0.0'
handling: 0 (globally, and for each individual item)
shipping: 0 (globally, and for each individual item)
discount: 0 (globally, and for each individual item)
item.quantity: 1
total_tax: 0
time_stamp: the current time
total_amount: calculated according to the safecharge docs:
  total = shipping + handling - discount
  for each item
    total += (item.amount - item.discount + item.shipping + item.handling)*item.quantity
  total *= (1 + total_tax/100)
```

### validate(checksum, data, [secret])

Validates Safecharges response against `checksum`.

`data` is an object, containing `totalAmount`, `currency`, `responseTimeStamp`, `PPP_TransactionID`, `Status`, `productId` fields.

`secret` defaults to `process.env.SAFECHARGE_SECRET`.
