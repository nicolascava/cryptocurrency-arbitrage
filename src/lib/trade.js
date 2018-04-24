import winston from 'winston';
import chalk from 'chalk';

import checkOrderAndDiscardItIfNecessary from './checkOrderAndDiscardItIfNecessary';
import logWhenOrderIsDone from './logWhenOrderIsDone';
import closeTrade from './closeTrade';

function getChain1Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  return [
    {
      exchange: bestChain.exchange1,
      symbolCurrency: marketCurrency2,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order1Quantity,
      price: bestChain.order1.price,
      makeOrder: bestChain.exchange1.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange1.lotSize[marketCurrency2 + marketCurrency1],
    },
    {
      exchange: bestChain.exchange2,
      symbolCurrency,
      marketCurrency: marketCurrency2,
      quantity: bestChain.order2Quantity,
      price: bestChain.order2.price,
      makeOrder: bestChain.exchange2.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange2.lotSize[symbolCurrency + marketCurrency2],
    },
    {
      exchange: bestChain.exchange3,
      symbolCurrency,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order3Quantity,
      price: bestChain.order3.price,
      makeOrder: bestChain.exchange3.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange3.lotSize[symbolCurrency + marketCurrency1],
    },
  ];
}

function getChain2Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  return [
    {
      exchange: bestChain.exchange1,
      symbolCurrency,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order1Quantity,
      price: bestChain.order1.price,
      makeOrder: bestChain.exchange1.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange1.lotSize[symbolCurrency + marketCurrency1],
    },
    {
      exchange: bestChain.exchange2,
      symbolCurrency,
      marketCurrency: marketCurrency2,
      quantity: bestChain.order2Quantity,
      price: bestChain.order2.price,
      makeOrder: bestChain.exchange2.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange2.lotSize[symbolCurrency + marketCurrency2],
    },
    {
      exchange: bestChain.exchange3,
      symbolCurrency: marketCurrency2,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order3Quantity,
      price: bestChain.order3.price,
      makeOrder: bestChain.exchange3.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange3.lotSize[marketCurrency2 + marketCurrency1],
    },
  ];
}

function getChain3Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  return [
    {
      exchange: bestChain.exchange1,
      symbolCurrency: marketCurrency2,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order1Quantity,
      price: bestChain.order1.price,
      makeOrder: bestChain.exchange1.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange1.lotSize[marketCurrency2 + marketCurrency1],
    },
    {
      exchange: bestChain.exchange2,
      symbolCurrency,
      marketCurrency: marketCurrency2,
      quantity: bestChain.order2Quantity,
      price: bestChain.order2.price,
      makeOrder: bestChain.exchange2.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange2.lotSize[symbolCurrency + marketCurrency2],
    },
    {
      exchange: bestChain.exchange3,
      symbolCurrency,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order3Quantity,
      price: bestChain.order3.price,
      makeOrder: bestChain.exchange3.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange3.lotSize[symbolCurrency + marketCurrency1],
    },
  ];
}

function getChain4Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  return [
    {
      exchange: bestChain.exchange1,
      symbolCurrency,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order1Quantity,
      price: bestChain.order1.price,
      makeOrder: bestChain.exchange1.sell,
      orderType: 'sell',
      lotSize: bestChain.exchange1.lotSize[symbolCurrency + marketCurrency1],
    },
    {
      exchange: bestChain.exchange2,
      symbolCurrency,
      marketCurrency: marketCurrency2,
      quantity: bestChain.order2Quantity,
      price: bestChain.order2.price,
      makeOrder: bestChain.exchange2.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange2.lotSize[symbolCurrency + marketCurrency2],
    },
    {
      exchange: bestChain.exchange3,
      symbolCurrency: marketCurrency2,
      marketCurrency: marketCurrency1,
      quantity: bestChain.order3Quantity,
      price: bestChain.order3.price,
      makeOrder: bestChain.exchange3.buy,
      orderType: 'buy',
      lotSize: bestChain.exchange3.lotSize[marketCurrency2 + marketCurrency1],
    },
  ];
}

function resolveExchanges(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  let exchanges = null;

  if (bestChain.chainID === 'A2') {
    exchanges = getChain2Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A3') {
    exchanges = getChain3Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A4') {
    exchanges = getChain4Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else {
    exchanges = getChain1Config(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  }

  return exchanges;
}

export default function (bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  return new Promise(async (resolve) => {
    let ordersDone = 0;

    winston.info(chalk.cyan('Placing orders...'));

    // TODO: do not scale with more than 3 nodes.
    const exchanges = resolveExchanges(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);

    exchanges.forEach((item, index) =>
      item.makeOrder(item.symbolCurrency, item.marketCurrency, item.quantity, item.price)
        .then(async () => {
          logWhenOrderIsDone(
            item.exchange,
            item.quantity,
            item.price,
            item.symbolCurrency,
            item.marketCurrency,
            index + 1,
          );

          // If the order succeed, we have to check the open orders and react if they last too
          // long in the order book.
          await checkOrderAndDiscardItIfNecessary(
            item.exchange.cancelOrder,
            item.exchange.openOrders,
            item.makeOrder,
            item.orderType,
            item.symbolCurrency,
            item.marketCurrency,
            item.lotSize,
            index + 1,
            item.exchange.name,
            item.price,
          );

          ordersDone += 1;

          if (ordersDone === 3) {
            return closeTrade(bestChain, symbolCurrency, marketCurrency1, marketCurrency2, resolve);
          }

          return null;
        })
        .catch());
  });
}
