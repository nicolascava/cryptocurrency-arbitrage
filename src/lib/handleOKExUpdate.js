import _ from 'lodash';

import { okexOrderBookInit, rawOKExOrderBook } from '../config/Base';

export default function (parsedData, pair) {
  if (!okexOrderBookInit[pair]) return null;

  if (parsedData[0].data.bids) {
    parsedData[0].data.bids.forEach((item) => {
      let added = true;

      rawOKExOrderBook[pair].bids = _.filter(rawOKExOrderBook[pair].bids, (order, index) => {
        if (order.price === parseFloat(item[0])) {
          added = false;

          if (parseFloat(item[1]) === 0) return false;

          if (order.price === parseFloat(item[0])) {
            rawOKExOrderBook[pair].bids[index] = {
              ...order,
              quantity: parseFloat(item[1]),
            };
          }
        }

        return true;
      });

      if (added) {
        rawOKExOrderBook[pair].bids.push({
          price: parseFloat(item[0]),
          quantity: parseFloat(item[1]),
        });
      }
    });
  }

  if (parsedData[0].data.asks) {
    parsedData[0].data.asks.forEach((item) => {
      let added = true;

      rawOKExOrderBook[pair].asks = _.filter(rawOKExOrderBook[pair].asks, (order, index) => {
        if (order.price === parseFloat(item[0])) {
          added = false;

          if (parseFloat(item[1]) === 0) return false;

          if (order.price === parseFloat(item[0])) {
            rawOKExOrderBook[pair].asks[index] = {
              ...order,
              quantity: parseFloat(item[1]),
            };
          }
        }

        return true;
      });

      if (added) {
        rawOKExOrderBook[pair].asks.push({
          price: parseFloat(item[0]),
          quantity: parseFloat(item[1]),
        });
      }
    });
  }

  rawOKExOrderBook[pair].bids = _.orderBy(rawOKExOrderBook[pair].bids, ['price'], ['desc']);
  rawOKExOrderBook[pair].asks = _.orderBy(rawOKExOrderBook[pair].asks, ['price'], ['asc']);

  return null;
}
