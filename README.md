# Hasura Auth JS SDK

Hasura Auth JS SDK to handle **Auth** with [Hasura](https://hasura.io/).

## Install

`$ npm install hasura-auth-js`

or

`$ yarn add hasura-auth-js`

## Documentation

[https://docs.nhost.io/libraries/nhost-js-sdk](https://docs.nhost.io/libraries/nhost-js-sdk)

```
type PaymentIntentResult =
| {paymentIntent: PaymentIntent; error?: undefined}
| {paymentIntent?: undefined; error: StripeError};
```

Tips:
https://github.com/stripe/stripe-js/blob/9801d2c0ef0d255c005ee40c195e76f55af312f7/types/stripe-js/index.d.ts
