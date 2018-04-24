import request from 'request';
import crypto from 'crypto';
import winston from 'winston';
import chalk from 'chalk';
import queryString from 'querystring';

import {
  binanceAPIKey,
  binanceSecret,
  binanceConfig,
  recvWindow,
  abortRequestTimeout,
} from '../config/Base';
import isJSON from '../lib/isJSON';

function buildSign(params) {
  return crypto.createHmac('sha256', binanceSecret).update(params).digest('hex');
}

function normalizeCurrency(currency) {
  return currency === 'BCC' ? 'BCH' : currency;
}

function reverseNormalizeCurrency(currency) {
  return currency === 'BCH' ? 'BCC' : currency;
}

function handleRequestRetry(input) {
  return setTimeout(async () => {
    const {
      runningRequest,
      resolve,
      reject,
      action,
      actionParams,
    } = input;

    runningRequest.abort();

    const data = actionParams ?
      await action(actionParams).catch(() => reject()) :
      await action().catch(() => reject());

    return resolve(data);
  }, abortRequestTimeout);
}

function handleRequestError(error, body, reject) {
  if (error || !isJSON(body)) {
    winston.info(chalk.red('An error occurred with Binance:'), error, body);

    return reject();
  }

  // TODO: we do not need to parse the body twice.
  const parsedBody = JSON.parse(body);

  if (parsedBody.code) {
    winston.info(chalk.red('An error occurred with Binance:'), parsedBody.msg);

    return reject();
  }

  return null;
}

function handleRequestResponse(input) {
  const {
    requestTimeout,
    runningRequest,
    error,
    body,
    reject,
  } = input;

  if (requestTimeout) clearTimeout(requestTimeout);

  runningRequest.end();
  handleRequestError(error, body, reject);
}

function reduceBalances(accumulation, current) {
  const asset = normalizeCurrency(current.asset);

  return {
    ...accumulation,
    [asset]: parseFloat(current.free),
  };
}

export function getServerTime() {
  return new Promise(async (resolve, reject) => {
    const options = {
      url: 'https://api.binance.com/api/v1/time',
      method: 'GET',
    };

    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      handleRequestResponse({
        requestTimeout,
        runningRequest,
        error,
        body,
        reject,
      });

      const parsedBody = JSON.parse(body);

      return resolve(parsedBody.serverTime);
    });

    requestTimeout = handleRequestRetry({
      runningRequest,
      resolve,
      reject,
      action: getServerTime,
    });

    return null;
  });
}

export function getBalances() {
  return new Promise(async (resolve, reject) => {
    // TODO: why the API key is not defined on the module instantiation?
    const headers = {
      'X-MBX-APIKEY': binanceAPIKey,
    };

    const params = {
      recvWindow,
      timestamp: binanceConfig.nonce,
    };
    const stringifiedParams = queryString.stringify(params);
    const sign = buildSign(stringifiedParams);
    const options = {
      url: `https://api.binance.com/api/v3/account?${stringifiedParams}&signature=${sign}`,
      method: 'GET',
      headers,
    };

    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      handleRequestResponse({
        requestTimeout,
        runningRequest,
        error,
        body,
        reject,
      });

      const parsedBody = JSON.parse(body);
      const data = parsedBody.balances.reduce(reduceBalances, {});

      return resolve(data);
    });

    requestTimeout = handleRequestRetry({
      runningRequest,
      resolve,
      reject,
      action: getBalances,
    });

    return null;
  });
}

function makeOrder(input) {
  return new Promise(async (resolve, reject) => {
    const {
      firstCurrency,
      secondCurrency,
      amount,
      price,
      side,
    } = input;
    const headers = {
      'X-MBX-APIKEY': binanceAPIKey,
    };
    const pair = reverseNormalizeCurrency(firstCurrency) + secondCurrency;
    const params = {
      recvWindow,
      timestamp: binanceConfig.nonce,
      symbol: pair,
      side,
      type: 'LIMIT',
      quantity: amount,
      price,
      timeInForce: 'GTC',
    };
    const stringifiedParams = queryString.stringify(params);
    const sign = buildSign(stringifiedParams);
    const options = {
      url: `https://api.binance.com/api/v3/order?${stringifiedParams}&signature=${sign}`,
      method: 'POST',
      headers,
    };

    const runningRequest = request(options, (error, response, body) => {
      handleRequestResponse({
        runningRequest,
        error,
        body,
        reject,
      });

      return resolve();
    });

    return null;
  });
}

export function buy(firstCurrency, secondCurrency, amount, price) {
  return makeOrder({
    firstCurrency,
    secondCurrency,
    amount,
    price,
    side: 'BUY',
  });
}

export function sell(firstCurrency, secondCurrency, amount, price) {
  return makeOrder({
    firstCurrency,
    secondCurrency,
    amount,
    price,
    side: 'SELL',
  });
}

export function getOpenOrders({ currency, marketCurrency }) {
  return new Promise(async (resolve, reject) => {
    const headers = {
      'X-MBX-APIKEY': binanceAPIKey,
    };
    const params = {
      recvWindow,
      timestamp: binanceConfig.nonce,
      symbol: reverseNormalizeCurrency(currency) + marketCurrency,
    };
    const stringifiedParams = queryString.stringify(params);
    const sign = buildSign(stringifiedParams);
    const options = {
      url: `https://api.binance.com/api/v3/openOrders?${stringifiedParams}&signature=${sign}`,
      method: 'GET',
      headers,
    };

    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      handleRequestResponse({
        requestTimeout,
        runningRequest,
        error,
        body,
        reject,
      });

      const parsedBody = JSON.parse(body);

      if (parsedBody.length === 0) return resolve([]);

      const baseData = parsedBody[0];
      const baseQuantity = parseFloat(baseData.origQty);
      const filledQuantity = parseFloat(baseData.executedQty);
      const orderID = baseData.orderId;
      const responseData = [
        {
          id: orderID,
          quantity: baseQuantity - filledQuantity,
        },
      ];

      return resolve(responseData);
    });

    requestTimeout = handleRequestRetry({
      runningRequest,
      resolve,
      reject,
      action: getOpenOrders,
      actionParams: { currency, marketCurrency },
    });

    return null;
  });
}

export function cancelOrder({ orderID, currency, marketCurrency }) {
  return new Promise(async (resolve, reject) => {
    const headers = {
      'X-MBX-APIKEY': binanceAPIKey,
    };
    const pair = reverseNormalizeCurrency(currency) + marketCurrency;
    const params = {
      recvWindow,
      timestamp: binanceConfig.nonce,
      symbol: pair,
      orderId: orderID,
    };
    const stringifiedParams = queryString.stringify(params);
    const sign = buildSign(stringifiedParams);
    const options = {
      url: `https://api.binance.com/api/v3/order?${stringifiedParams}&signature=${sign}`,
      method: 'DELETE',
      headers,
    };

    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      handleRequestResponse({
        requestTimeout,
        runningRequest,
        error,
        body,
        reject,
      });

      return resolve();
    });

    requestTimeout = handleRequestRetry({
      runningRequest,
      resolve,
      reject,
      action: cancelOrder,
      actionParams: { orderID, currency, marketCurrency },
    });

    return null;
  });
}
