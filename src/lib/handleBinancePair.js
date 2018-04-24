import binance from 'node-binance-api';

import checkChain from './checkChain';
import { currencies } from '../config/Base';

export default function (orderBooks, depth, pair) {
  const mutableOB = orderBooks;

  const bids = binance.sortBids(depth.bids);
  const asks = binance.sortAsks(depth.asks);

  const askPrices = Object.keys(asks);
  const normalizedAsks = askPrices.map((item, index) => ({
    quantity: parseFloat(asks[askPrices[index]]),
    price: parseFloat(askPrices[index]),
  }));

  const bidPrices = Object.keys(bids);
  const normalizedBids = bidPrices.map((item, index) => ({
    quantity: parseFloat(bids[bidPrices[index]]),
    price: parseFloat(bidPrices[index]),
  }));

  mutableOB.Binance[pair].lowestAsk.price = normalizedAsks[0].price;
  mutableOB.Binance[pair].lowestAsk.quantity = normalizedAsks[0].quantity;

  mutableOB.Binance[pair].highestBid.price = normalizedBids[0].price;
  mutableOB.Binance[pair].highestBid.quantity = normalizedBids[0].quantity;

  mutableOB.Binance[pair].asks = normalizedAsks;
  mutableOB.Binance[pair].bids = normalizedBids;

  mutableOB.Binance[pair].init = true;

  currencies.forEach(item =>
    checkChain(mutableOB, item.symbolCurrency, item.marketCurrency1, item.marketCurrency2));

  return null;
}
