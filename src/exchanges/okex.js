import request from 'request';
import crypto from 'crypto';
import winston from 'winston';
import chalk from 'chalk';

import { okexAPIKey, okexSecret } from '../config/Base';
import isJSON from '../lib/isJSON';

export function getBalances(coin = null) {
  return new Promise(async (resolve, reject) => {
    const params = `api_key=${okexAPIKey}&secret_key=${okexSecret}`;
    const sign = crypto.createHash('md5').update(params).digest('hex').toUpperCase();
    const url = `https://www.okex.com/api/v1/userinfo.do?${params}&sign=${sign}`;
    const options = {
      url,
      method: 'POST',
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with OKEx:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (!parsedBody.result) {
        winston.info(chalk.red('An error occurred with OKEx:'), parsedBody.error_code);

        return reject();
      }

      const freeFunds = parsedBody.info.funds.free;
      const data = {};

      Object.keys(freeFunds).forEach((item) => {
        data[item.toUpperCase()] = parseFloat(freeFunds[item]);
      });

      return resolve(data);
    });

    requestTimeout = setTimeout(async () => {
      if (requestIsRunning) {
        runningRequest.abort();

        const data = await getBalances(coin).catch(() => reject());

        return resolve(data);
      }

      return reject();
    }, 5000);

    return null;
  });
}

export function buy(firstCurrency, secondCurrency, amount, price) {
  return new Promise(async (resolve, reject) => {
    const params = `amount=${amount}&api_key=${okexAPIKey}&price=${price}&symbol=` +
      `${firstCurrency.toLowerCase()}_${secondCurrency.toLowerCase()}&type=buy&secret_key` +
      `=${okexSecret}`;
    const sign = crypto.createHash('md5').update(params).digest('hex').toUpperCase();
    const url = `https://www.okex.com/api/v1/trade.do?${params}&sign=${sign}`;
    const options = {
      url,
      method: 'POST',
    };

    const runningRequest = request(options, (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with OKEx:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (!parsedBody.result) {
        winston.info(chalk.red('An error occurred with OKEx:'), parsedBody.error_code);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}

export function sell(firstCurrency, secondCurrency, amount, price) {
  return new Promise(async (resolve, reject) => {
    const params = `amount=${amount}&api_key=${okexAPIKey}&price=${price}&symbol=` +
      `${firstCurrency.toLowerCase()}_${secondCurrency.toLowerCase()}&type=sell&secret_key=` +
      `${okexSecret}`;
    const sign = crypto.createHash('md5').update(params).digest('hex').toUpperCase();
    const url = `https://www.okex.com/api/v1/trade.do?${params}&sign=${sign}`;
    const options = {
      url,
      method: 'POST',
    };

    const runningRequest = request(options, (error, response, body) => {
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with OKEx:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (!parsedBody.result) {
        winston.info(chalk.red('An error occurred with OKEx:'), parsedBody.error_code);

        return reject();
      }

      return resolve();
    });

    return null;
  });
}

export function getOpenOrders({ currency, marketCurrency }) {
  return new Promise(async (resolve, reject) => {
    const params = `api_key=${okexAPIKey}&order_id=-1&symbol=${currency.toLowerCase()}_` +
      `${marketCurrency.toLowerCase()}&secret_key=${okexSecret}`;
    const sign = crypto.createHash('md5').update(params).digest('hex').toUpperCase();
    const url = `https://www.okex.com/api/v1/order_info.do?${params}&sign=${sign}`;
    const options = {
      url,
      method: 'POST',
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with OKEx:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (!parsedBody.result) {
        winston.info(chalk.red('An error occurred with OKEx:'), parsedBody.error_code);

        return reject();
      }

      if (parsedBody.orders.length === 0) return resolve([]);

      return resolve([
        {
          id: parsedBody.orders[0].order_id,
          quantity: parseFloat(parsedBody.orders[0].amount) -
            parseFloat(parsedBody.orders[0].deal_amount),
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
    const params = `api_key=${okexAPIKey}&order_id=${orderID}&symbol=` +
      `${currency.toLowerCase()}_${marketCurrency.toLowerCase()}&secret_key=${okexSecret}`;
    const sign = crypto.createHash('md5').update(params).digest('hex').toUpperCase();
    const url = `https://www.okex.com/api/v1/cancel_order.do?${params}&sign=${sign}`;
    const options = {
      url,
      method: 'POST',
    };

    let requestIsRunning = true;
    let requestTimeout = null;

    const runningRequest = request(options, (error, response, body) => {
      requestIsRunning = false;

      clearTimeout(requestTimeout);
      runningRequest.end();

      if (error || !isJSON(body)) {
        winston.info(chalk.red('An error occurred with OKEx:'), error, body);

        return reject();
      }

      const parsedBody = JSON.parse(body);

      if (!parsedBody.result) {
        winston.info(chalk.red('An error occurred with OKEx:'), parsedBody.error_code);

        return reject();
      }

      return resolve();
    });

    requestTimeout = setTimeout(async () => {
      if (requestIsRunning) {
        runningRequest.abort();

        const data = await cancelOrder({ orderID, currency, marketCurrency }).catch(() => reject());

        return resolve(data);
      }

      return reject();
    }, 5000);

    return null;
  });
}
