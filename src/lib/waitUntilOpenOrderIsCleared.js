import chalk from 'chalk';
import winston from 'winston';

import timeout from './timeout';
import { checkOrderLimit } from '../config/Base';

export default async function waitUntilOpenOrderIsCleared(
  getOpenOrders,
  orderType,
  symbolCurrency,
  marketCurrency,
  index,
  firstTry = true,
) {
  const checkOrderLimitComputed = firstTry ? checkOrderLimit : checkOrderLimit / 2;

  await timeout(checkOrderLimitComputed);

  const orders = await getOpenOrders({ currency: symbolCurrency, marketCurrency });

  if (orders.length > 0) {
    winston.info(chalk.yellow(`Order ${index} is still active (${orders[0].quantity} remaining)`));

    return orders[0];
  }

  return null;
}
