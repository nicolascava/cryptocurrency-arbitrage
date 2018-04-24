import _ from 'lodash';

export default function (orderBookModify, poloniexOrderBook, pair) {
  const mutablePOB = poloniexOrderBook;

  orderBookModify.forEach((item) => {
    const newQuantity = parseFloat(item.data.amount);
    const newPrice = parseFloat(item.data.rate);

    let added = true;

    if (item.data.type === 'bid') {
      mutablePOB[pair].bids.forEach((current, index) => {
        if (current.price === newPrice) {
          mutablePOB[pair].bids[index] = {
            ...current,
            quantity: newQuantity,
          };
          added = false;
        }
      });

      if (added) {
        mutablePOB[pair].bids.push({
          price: newPrice,
          quantity: newQuantity,
        });
      }

      mutablePOB[pair].bids = _.orderBy(mutablePOB[pair].bids, ['price'], ['desc']);
    } else {
      mutablePOB[pair].asks.forEach((current, index) => {
        if (current.price === newPrice) {
          mutablePOB[pair].asks[index] = {
            ...current,
            quantity: newQuantity,
          };
          added = false;
        }
      });

      if (added) {
        mutablePOB[pair].asks.push({
          price: newPrice,
          quantity: newQuantity,
        });
      }

      mutablePOB[pair].asks = _.orderBy(mutablePOB[pair].asks, ['price'], ['asc']);
    }
  });
}
