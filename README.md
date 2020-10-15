# Aave Simulator

## JOB01

- Select an active borrower on the protocol at the selected block height (with some collateral and borrowings).
- Borrow another currency apart from the ones he is borrowing at the moment, moving his HF to exactly 1.1.
- "Force" the price oracle of AAVE to set a price that puts the previous borrower under liquidation.
- With a different account, liquidate the user.
- There is freedom to select the new borrowed currency.

## JOB02

- Select an active depositor on the protocol at the selected block height (with deposits, can be used as collateral or not).
- Transfer all of his available aTokens to transfer to another user account.
- With that user, redeem the aTokens, deposit again, and borrow another currency at stable rate.

## Pre requirements

### GANACHE

```
  npm install -g ganache
```

### Environment file

.env

```
  ALCHEMY_NODE=https://eth-mainnet.alchemyapi.io/v2/ YOUR KEY
  DEBUG=false
```

## Start JOBS

```
  npm start
```

### Exclude Jobs

Update the file simulations.json and set to `true` the value disabled.

### System's architecture

![architecture](/.statics/diagram.png)
