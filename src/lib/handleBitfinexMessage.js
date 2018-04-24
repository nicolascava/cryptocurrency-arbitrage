import winston from 'winston';
import chalk from 'chalk';

import checkChain from './checkChain';
import { currencies, rawOrderBooks } from '../config/Base';

export default function (pair) {
  return (ob) => {
    const formattedAsks = ob.asks.map(item => ({
      price: parseFloat(item[0]),
      quantity: Math.abs(parseFloat(item[2])),
    }));
    const formattedBids = ob.bids.map(item => ({
      price: parseFloat(item[0]),
      quantity: parseFloat(item[2]),
    }));

    if (formattedAsks.length > 0) {
      rawOrderBooks.Bitfinex[pair].lowestAsk.price = formattedAsks[0].price;
      rawOrderBooks.Bitfinex[pair].lowestAsk.quantity = formattedAsks[0].quantity;
      rawOrderBooks.Bitfinex[pair].asks = formattedAsks;
    }

    if (formattedBids.length > 0) {
      rawOrderBooks.Bitfinex[pair].highestBid.price = formattedBids[0].price;
      rawOrderBooks.Bitfinex[pair].highestBid.quantity = formattedBids[0].quantity;
      rawOrderBooks.Bitfinex[pair].bids = formattedBids;
    }

    rawOrderBooks.Bitfinex[pair].init = true;

    checkChain(rawOrderBooks, currencies)
      .then()
      .catch(error => winston.info(chalk.red('An unexpected error occurred'), error));
  };
}
