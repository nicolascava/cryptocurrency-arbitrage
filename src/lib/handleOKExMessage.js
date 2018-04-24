import _ from 'lodash';

import { okexOrderBookInit, rawOKExOrderBook, rawOrderBooks, monitoredPairs } from '../config/Base';
import handleOKExUpdate from './handleOKExUpdate';
import checkChain from './checkChain';

export default function () {
  return (data) => {
    const mutableOB = rawOrderBooks;
    const parsedData = JSON.parse(data);
    const { channel } = parsedData[0];
    const isFullOrderBook = channel === 'ok_sub_spot_bch_usdt_depth_50' ||
      channel === 'ok_sub_spot_bch_btc_depth_50' ||
      channel === 'ok_sub_spot_btc_usdt_depth_50';

    let pair = null;

    if (channel === 'addChannel') return null;

    if (channel === 'ok_sub_spot_bch_usdt_depth_50') {
      pair = 'BCHUSDT';
      okexOrderBookInit[pair] = true;
    }

    if (channel === 'ok_sub_spot_bch_btc_depth_50') {
      pair = 'BCHBTC';
      okexOrderBookInit[pair] = true;
    }

    if (channel === 'ok_sub_spot_btc_usdt_depth_50') {
      pair = 'BTCUSDT';
      okexOrderBookInit[pair] = true;
    }

    if (channel === 'ok_sub_spot_eth_btc_depth_50') {
      pair = 'ETHBTC';
      okexOrderBookInit[pair] = true;
    }

    if (channel === 'ok_sub_spot_bch_eth_depth_50') {
      pair = 'BCHETH';
      okexOrderBookInit[pair] = true;
    }

    if (channel === 'ok_sub_spot_bch_usdt_depth') {
      pair = 'BCHUSDT';

      if (pair && monitoredPairs.indexOf(pair) === -1) return null;

      handleOKExUpdate(parsedData, pair);
    }

    if (channel === 'ok_sub_spot_bch_btc_depth') {
      pair = 'BCHBTC';

      if (pair && monitoredPairs.indexOf(pair) === -1) return null;

      handleOKExUpdate(parsedData, pair);
    }

    if (channel === 'ok_sub_spot_btc_usdt_depth') {
      pair = 'BTCUSDT';

      if (pair && monitoredPairs.indexOf(pair) === -1) return null;

      handleOKExUpdate(parsedData, pair);
    }

    if (channel === 'ok_sub_spot_eth_btc_depth') {
      pair = 'ETHBTC';

      if (pair && monitoredPairs.indexOf(pair) === -1) return null;

      handleOKExUpdate(parsedData, pair);
    }

    if (channel === 'ok_sub_spot_bch_eth_depth') {
      pair = 'BCHETH';

      if (pair && monitoredPairs.indexOf(pair) === -1) return null;

      handleOKExUpdate(parsedData, pair);
    }

    if (pair && monitoredPairs.indexOf(pair) === -1) return null;
    if (isFullOrderBook && okexOrderBookInit[pair]) return null;

    if (isFullOrderBook && !okexOrderBookInit[pair]) {
      const formattedAsks = parsedData[0].data.asks.map(item => ({
        price: parseFloat(item[0]),
        quantity: parseFloat(item[1]),
      }));
      const formattedBids = parsedData[0].data.bids.map(item => ({
        price: parseFloat(item[0]),
        quantity: parseFloat(item[1]),
      }));

      rawOKExOrderBook[pair].asks = _.orderBy(formattedAsks, ['price'], ['asc']);
      rawOKExOrderBook[pair].bids = _.orderBy(formattedBids, ['price'], ['desc']);
    }

    if (rawOKExOrderBook[pair].asks.length > 0 && rawOKExOrderBook[pair].bids.length > 0) {
      mutableOB.OKEx[pair].lowestAsk.price = rawOKExOrderBook[pair].asks[0].price;
      mutableOB.OKEx[pair].lowestAsk.quantity = rawOKExOrderBook[pair].asks[0].quantity;

      mutableOB.OKEx[pair].highestBid.price = rawOKExOrderBook[pair].bids[0].price;
      mutableOB.OKEx[pair].highestBid.quantity = rawOKExOrderBook[pair].bids[0].quantity;

      mutableOB.OKEx[pair].asks = rawOKExOrderBook[pair].asks;
      mutableOB.OKEx[pair].bids = rawOKExOrderBook[pair].bids;

      mutableOB.OKEx[pair].init = true;

      checkChain(mutableOB);
    }

    return null;
  };
}
