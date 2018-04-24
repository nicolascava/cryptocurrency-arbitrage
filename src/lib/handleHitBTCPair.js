import _ from 'lodash';

import checkChain from './checkChain';

export default function (data, hitBTCOrderBook, orderBooks, pair) {
  const mutableHBOB = hitBTCOrderBook;
  const mutableOB = orderBooks;

  if (data.method === 'snapshotOrderbook') {
    const formattedAsks = data.params.ask.map(item => ({
      price: parseFloat(item.price),
      quantity: parseFloat(item.size),
    }));
    const formattedBids = data.params.bid.map(item => ({
      price: parseFloat(item.price),
      quantity: parseFloat(item.size),
    }));

    mutableHBOB[pair].asks = formattedAsks;
    mutableHBOB[pair].bids = formattedBids;
  }

  if (data.method === 'updateOrderbook') {
    data.params.bid.forEach((item) => {
      let added = true;

      mutableHBOB[pair].bids = _.filter(mutableHBOB[pair].bids, (order, index) => {
        if (order.price === parseFloat(item.price)) {
          added = false;

          if (parseFloat(item.size) === 0) return false;

          if (order.price === parseFloat(item.price)) {
            mutableHBOB[pair].bids[index] = {
              ...order,
              quantity: parseFloat(item.size),
            };
          }
        }

        return true;
      });

      if (added) {
        mutableHBOB[pair].bids.push({
          price: parseFloat(item.price),
          quantity: parseFloat(item.size),
        });
      }
    });

    data.params.ask.forEach((item) => {
      let added = true;

      mutableHBOB[pair].asks = _.filter(mutableHBOB[pair].asks, (order, index) => {
        if (order.price === parseFloat(item.price)) {
          added = false;

          if (parseFloat(item.size) === 0) return false;

          if (order.price === parseFloat(item.price)) {
            mutableHBOB[pair].asks[index] = {
              ...order,
              quantity: parseFloat(item.size),
            };
          }
        }

        return true;
      });

      if (added) {
        mutableHBOB[pair].asks.push({
          price: parseFloat(item.price),
          quantity: parseFloat(item.size),
        });
      }
    });

    mutableHBOB[pair].bids = _.orderBy(mutableHBOB[pair].bids, ['price'], ['desc']);
    mutableHBOB[pair].asks = _.orderBy(mutableHBOB[pair].asks, ['price'], ['asc']);
  }

  if (mutableHBOB[pair].asks.length > 0 && mutableHBOB[pair].bids.length > 0) {
    mutableOB.HitBTC[pair].lowestAsk.price = mutableHBOB[pair].asks[0].price;
    mutableOB.HitBTC[pair].lowestAsk.quantity = mutableHBOB[pair].asks[0].quantity;

    mutableOB.HitBTC[pair].highestBid.price = mutableHBOB[pair].bids[0].price;
    mutableOB.HitBTC[pair].highestBid.quantity = mutableHBOB[pair].bids[0].quantity;

    mutableOB.HitBTC[pair].asks = mutableHBOB[pair].asks;
    mutableOB.HitBTC[pair].bids = mutableHBOB[pair].bids;

    mutableOB.HitBTC[pair].init = true;

    checkChain(mutableOB);
  }
}
