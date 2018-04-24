import winston from 'winston';
import chalk from 'chalk';
import _ from 'lodash';

import waitUntilOpenOrderIsCleared from './waitUntilOpenOrderIsCleared';
import timeout from './timeout';
import { rawOrderBooks, nonInstantOrders, timeoutToPreventSyncIssues } from '../config/Base';

export function findBestOrder(orders, quantity) {
  return _.filter(orders, item => item.quantity >= quantity)[0];
}

export default async function checkOrderAndDiscardItIfNecessary(
  cancelOrder,
  getOpenOrders,
  makeOrder,
  orderType,
  symbolCurrency,
  marketCurrency,
  lotSize = null,
  index,
  exchangeName,
  currentPrice,
  firstTry = true,
) {
  // We check the open order until it is cleared from the order book.
  const order = await waitUntilOpenOrderIsCleared(
    getOpenOrders,
    orderType,
    symbolCurrency,
    marketCurrency,
    index,
    firstTry,
  );

  // If it is cleared, we just end with this trading scenario.
  if (!order) {
    winston.info(chalk.green(`Order ${index} is cleared (${orderType})`));

    return null;
  }

  winston.info(chalk.yellow(`Order ${index} was not taken. Running fallback strategy`));

  if (nonInstantOrders.indexOf(index) === -1) nonInstantOrders.push(index);

  const pair = symbolCurrency + marketCurrency;
  const { asks } = rawOrderBooks[exchangeName][pair];
  const { bids } = rawOrderBooks[exchangeName][pair];

  try {
    // Then we cancel the current order.
    await cancelOrder({ orderID: order.id, currency: symbolCurrency, marketCurrency });

    winston.info(chalk.red(`Order ${index} cancelled`));
  } catch (error) {
    winston.info(chalk.green(`Order ${index} was taken just before cancelling it`));

    return null;
  }

  await timeout(timeoutToPreventSyncIssues);

  const bestOrder = orderType === 'sell' ?
    findBestOrder(bids, order.quantity) : findBestOrder(asks, order.quantity);

  if (!bestOrder) {
    winston.info(chalk.red('No order available to trade the remnant'));

    return null;
  }

  if (currentPrice !== bestOrder.price) {
    winston.info(chalk.yellow(`Retrying order ${index} at best ' +
      'price (${bestOrder.price} ${marketCurrency})`));

    const lotSizeIsInaccurate = lotSize &&
      (lotSize.quantity > order.quantity ||
        lotSize.orderValue > (order.quantity * bestOrder.price) ||
        ((`${order.quantity}`).split('.')[1] &&
          lotSize.decimals < (`${order.quantity}`).split('.')[1].length));

    if (lotSizeIsInaccurate) {
      winston.info(chalk.green(`Lot size inaccurate. We don't retry the order ${index}`));

      return null;
    }

    // Finally we make another order with the remnant quantity.
    await makeOrder(symbolCurrency, marketCurrency, order.quantity, bestOrder.price);
  } else {
    winston.info(chalk.red('Best order price is the same, it\'s probably an unexpected behavior'));
  }

  // We loop again to validate if our order clear or not.
  return checkOrderAndDiscardItIfNecessary(
    cancelOrder,
    getOpenOrders,
    makeOrder,
    orderType,
    symbolCurrency,
    marketCurrency,
    lotSize,
    index,
    exchangeName,
    bestOrder.price,
    false,
  );
}
