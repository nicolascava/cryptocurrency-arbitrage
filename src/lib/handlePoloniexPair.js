import _ from 'lodash';
import winston from 'winston';
import chalk from 'chalk';

import handlePoloniexOrderBookMessage from './handlePoloniexOrderBookMessage';
import handlePoloniexOrderBookRemoveMessage from './handlePoloniexOrderBookRemoveMessage';
import handlePoloniexOrderBookModifyMessage from './handlePoloniexOrderBookModifyMessage';
import checkChain from './checkChain';
import { currencies, rawOrderBooks } from '../config/Base';

export default function (data, poloniexOrderBook, orderBooks, pair) {
  const mutableOB = orderBooks;
  const orderBook = _.filter(data, { type: 'orderBook' });
  const orderBookModify = _.filter(data, { type: 'orderBookModify' });
  const orderBookRemove = _.filter(data, { type: 'orderBookRemove' });

  if (orderBook.length > 0) handlePoloniexOrderBookMessage(orderBook, poloniexOrderBook, pair);

  if (orderBookRemove.length > 0) {
    handlePoloniexOrderBookRemoveMessage(orderBookRemove, poloniexOrderBook, pair);
  }

  if (orderBookModify.length > 0) {
    handlePoloniexOrderBookModifyMessage(orderBookModify, poloniexOrderBook, pair);
  }

  // TODO: handle message sequence.
  // Queue message in the future until previous sequence is done.

  mutableOB.Poloniex[pair].lowestAsk.price = poloniexOrderBook[pair].asks[0].price;
  mutableOB.Poloniex[pair].lowestAsk.quantity = poloniexOrderBook[pair].asks[0].quantity;

  mutableOB.Poloniex[pair].highestBid.price = poloniexOrderBook[pair].bids[0].price;
  mutableOB.Poloniex[pair].highestBid.quantity = poloniexOrderBook[pair].bids[0].quantity;

  mutableOB.Poloniex[pair].bids = poloniexOrderBook[pair].bids;
  mutableOB.Poloniex[pair].asks = poloniexOrderBook[pair].asks;

  mutableOB.Poloniex[pair].init = true;

  checkChain(rawOrderBooks, currencies)
    .then()
    .catch(error => winston.info(chalk.red('An unexpected error occurred'), error));
}
