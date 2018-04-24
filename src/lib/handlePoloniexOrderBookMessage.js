export default function (orderBook, poloniexOrderBook, pair) {
  const mutablePOB = poloniexOrderBook;
  const { asks } = orderBook[0].data;
  const askPrices = Object.keys(asks);
  const normalizedAsks = askPrices.map((item, index) => ({
    quantity: parseFloat(asks[askPrices[index]]),
    price: parseFloat(askPrices[index]),
  }));

  const { bids } = orderBook[0].data;
  const bidPrices = Object.keys(bids);
  const normalizedBids = bidPrices.map((item, index) => ({
    quantity: parseFloat(bids[bidPrices[index]]),
    price: parseFloat(bidPrices[index]),
  }));

  mutablePOB[pair].asks = normalizedAsks;
  mutablePOB[pair].bids = normalizedBids;
}
