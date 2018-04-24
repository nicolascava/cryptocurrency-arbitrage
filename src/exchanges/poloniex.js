import request from 'request';
import queryString from 'querystring';
import crypto from 'crypto';
import winston from 'winston';
import chalk from 'chalk';

import isJSON from '../lib/isJSON';
import { poloniexAPIKey, poloniexSecret } from '../config/Base';

let lastNonce = Date.now();

function getLastNonce() {
  lastNonce = lastNonce < Date.now() ? Date.now() : lastNonce + 1;

  return lastNonce;
}

export function getBalances() {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'returnBalances',
      nonce: getLastNonce(),
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, async (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);
      const normalizedData = {};

      if (parsedBody.error) {
        if (parsedBody.error.indexOf('Nonce must be greater than') > -1) {
          const data = await getBalances().catch(() => reject());

          return resolve(data);
        }

        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      Object.keys(parsedBody).forEach((item) => {
        normalizedData[item] = parseFloat(parsedBody[item]);
      });

      return resolve(normalizedData);
    });

    requestTimeout = setTimeout(async () => {
      if (requestIsRunning) {
        runningRequest.abort();

        const data = await getBalances().catch(() => reject());

        return resolve(data);
      }

      return reject();
    }, 5000);

    return null;
  });
}

export function buy(firstCurrency, secondCurrency, amount, price) {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'buy',
      nonce: getLastNonce(),
      currencyPair: `${secondCurrency}_${firstCurrency}`,
      rate: price,
      amount,
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    const runningRequest = request(options, async (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        if (parsedBody.error.indexOf('Nonce must be greater than') > -1) {
          await buy(firstCurrency, secondCurrency, amount, price).catch(() => reject());

          return resolve();
        }

        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}

export function sell(firstCurrency, secondCurrency, amount, price) {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'sell',
      nonce: getLastNonce(),
      currencyPair: `${secondCurrency}_${firstCurrency}`,
      rate: price,
      amount,
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    const runningRequest = request(options, async (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        if (parsedBody.error.indexOf('Nonce must be greater than') > -1) {
          await sell(firstCurrency, secondCurrency, amount, price).catch(() => reject());

          return resolve();
        }

        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}

export function getOpenOrders({ currency, marketCurrency }) {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'returnOpenOrders',
      nonce: getLastNonce(),
      currencyPair: `${marketCurrency}_${currency}`,
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, async (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.error('An error occurred with Poloniex:', error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        if (parsedBody.error.indexOf('Nonce must be greater than') > -1) {
          const data = await getOpenOrders({ currency, marketCurrency }).catch(() => reject());

          return resolve(data);
        }

        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      if (parsedBody.length === 0) return resolve([]);

      return resolve([
        {
          id: parsedBody[0].orderNumber,
          quantity: parseFloat(parsedBody[0].amount),
        },
      ]);
    });

    requestTimeout = setTimeout(async () => {
      if (requestIsRunning) {
        runningRequest.abort();

        const data = await getOpenOrders({ currency, marketCurrency }).catch(() => reject());

        return resolve(data);
      }

      return reject();
    }, 5000);

    return null;
  });
}

export function cancelOrder({ orderID, currency, marketCurrency }) {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'cancelOrder',
      nonce: getLastNonce(),
      orderNumber: orderID,
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, async (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        if (parsedBody.error.indexOf('Nonce must be greater than') > -1) {
          await cancelOrder({ orderID, currency, marketCurrency }).catch(() => reject());

          return resolve();
        }

        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      return resolve();
    });

    requestTimeout = setTimeout(async () => {
      if (requestIsRunning) {
        runningRequest.abort();

        await cancelOrder({ orderID, currency, marketCurrency }).catch(() => reject());

        return resolve();
      }

      return reject();
    }, 5000);

    return null;
  });
}

export function getDepositAddress() {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'returnDepositAddresses',
      nonce: getLastNonce(),
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    const runningRequest = request(options, (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}

export function getTradeHistory(firstCurrency, secondCurrency) {
  return new Promise(async (resolve, reject) => {
    const requestBody = {
      command: 'returnTradeHistory',
      nonce: getLastNonce(),
      currencyPair: `${secondCurrency}_${firstCurrency}`,
    };
    const payload = queryString.stringify(requestBody);
    const sign = crypto.createHmac('sha512', poloniexSecret).update(payload).digest('hex');
    const options = {
      url: 'https://poloniex.com/tradingApi',
      method: 'POST',
      headers: {
        Key: poloniexAPIKey,
        Sign: sign,
      },
      form: payload,
    };

    const runningRequest = request(options, (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with Poloniex:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (parsedBody.error) {
        winston.info(chalk.red('An error occurred with Poloniex:'), parsedBody.error);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}
