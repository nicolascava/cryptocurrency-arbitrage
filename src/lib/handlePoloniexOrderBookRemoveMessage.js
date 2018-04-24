import _ from 'lodash';

export default function (orderBookRemove, poloniexOrderBook, pair) {
  const mutablePOB = poloniexOrderBook;

  orderBookRemove.forEach((item) => {
    if (item.data.type === 'bid') {
      mutablePOB[pair].bids = _.filter(mutablePOB[pair].bids, order =>
        order.price !== parseFloat(item.data.rate));
    } else {
      mutablePOB[pair].asks = _.filter(mutablePOB[pair].asks, order =>
        order.price !== parseFloat(item.data.rate));
    }
  });
}
