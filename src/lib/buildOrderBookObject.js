import { monitoredPairs, rawOrderBooks } from '../config/Base';

export default function (exchange) {
  const object = {};

  monitoredPairs.forEach((monitoredPair) => {
    object[monitoredPair] = {
      init: false,
      lowestAsk: {
        price: 0,
        quantity: 0,
      },
      highestBid: {
        price: 0,
        quantity: 0,
      },
      asks: [],
      bids: [],
    };
  });
  rawOrderBooks[exchange.name] = object;
}
