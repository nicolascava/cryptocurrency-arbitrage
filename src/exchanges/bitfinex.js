import BFX, { Models } from 'bitfinex-api-node';
import winston from 'winston';
import chalk from 'chalk';
import _ from 'lodash';

import { bitfinexAPIKey, bitfinexSecret } from '../config/Base';

let ws = null;

export function initWebSocketConnection() {
  const bfxWS = new BFX({
    apiKey: bitfinexAPIKey,
    apiSecret: bitfinexSecret,
    ws: {
      manageOrderBooks: true,
      transform: true,
      autoReconnect: true,
      seqAudit: false,
      packetWDDelay: 10 * 1000,
    },
  });

  ws = bfxWS.ws();

  ws.on('open', () => {
    winston.info(chalk.yellow('Bitfinex socket opened'));

    ws.subscribeOrderBook('tETHBTC');
    ws.subscribeOrderBook('tBCHBTC');
    ws.subscribeOrderBook('tOMGBTC');
    ws.subscribeOrderBook('tBCHETH');
    ws.subscribeOrderBook('tOMGETH');

    ws.auth();
  });

  ws.on('error', error => winston.info(chalk.red('An error occurred with Bitfinex:'), error));
  ws.on('close', () => winston.info(chalk.yellow('Bitfinex socket closed')));

  ws.open();

  return ws;
}

export function getOpenOrders({ currency, marketCurrency }) {
  return new Promise((resolve, reject) => {
    const bfx = new BFX({
      apiKey: bitfinexAPIKey,
      apiSecret: bitfinexSecret,
    });
    const rest = bfx.rest(2, { transform: true });

    rest.activeOrders(async (error, orders) => {
      if (error) {
        if (error.message && error.message.indexOf('nonce: small') > -1) {
          const data = await getOpenOrders({ currency, marketCurrency }).catch(() => reject());

          return resolve(data);
        }

        winston.info(chalk.red('An error occurred with Bitfinex:'), error.message);

        return reject();
      }

      if (orders.length === 0) return resolve([]);

      const pair = `t${currency + marketCurrency}`;
      const filteredOrders = _.filter(orders, order => order.symbol === pair);
      const normalizedOrders = filteredOrders.map(order => ({
        id: order.id,
        quantity: Math.abs(order.amount),
      }));

      return resolve(normalizedOrders);
    }).catch(async (error) => {
      winston.info(chalk.red('An error occurred with Bitfinex:'), error);

      return reject();
    });
  });
}

export function getBalances() {
  return new Promise((resolve, reject) => {
    const bfx = new BFX({
      apiKey: bitfinexAPIKey,
      apiSecret: bitfinexSecret,
    });
    const rest = bfx.rest(2, { transform: true });

    rest.wallets(async (error, balances) => {
      if (error) {
        if (error.message && error.message.indexOf('nonce: small') > -1) {
          const data = await getBalances().catch(() => reject());

          return resolve(data);
        }

        winston.info(chalk.red('An error occurred with Bitfinex:'), error.message);

        return reject();
      }

      // TODO: automatize this.
      const normalizedBalances = {
        ETH: 0,
        BCH: 0,
        BTC: 0,
        OMG: 0,
      };

      balances.forEach((balance) => {
        normalizedBalances[balance.currency] = balance.balance;
      });

      return resolve(normalizedBalances);
    }).catch(async (error) => {
      winston.info(chalk.red('An error occurred with Bitfinex:'), error);

      return reject();
    });
  });
}

export function buy(firstCurrency, secondCurrency, amount, price) {
  return new Promise((resolve, reject) => {
    const pair = `t${firstCurrency}${secondCurrency}`;
    const order = new Models.Order({
      cid: Date.now(),
      symbol: pair,
      amount: Math.abs(amount),
      price,
      type: 'EXCHANGE LIMIT',
    }, ws);

    order
      .submit()
      .then(() => resolve())
      .catch((error) => {
        winston.info(chalk.red('An error occurred with Bitfinex:'), error);

        return reject();
      });
  });
}

export function sell(firstCurrency, secondCurrency, amount, price) {
  return new Promise((resolve, reject) => {
    const pair = `t${firstCurrency}${secondCurrency}`;
    const order = new Models.Order({
      cid: Date.now(),
      symbol: pair,
      amount: -Math.abs(amount),
      price,
      type: 'EXCHANGE LIMIT',
    }, ws);

    order
      .submit()
      .then(() => resolve())
      .catch((error) => {
        winston.info(chalk.red('An error occurred with Bitfinex:'), error);

        return reject();
      });
  });
}

export function cancelOrder({ orderID }) {
  return new Promise((resolve, reject) =>
    ws
      .cancelOrder(orderID)
      .then(() => resolve())
      .catch((error) => {
        winston.info(chalk.red('An error occurred with Bitfinex:'), error);

        return reject();
      }));
}
