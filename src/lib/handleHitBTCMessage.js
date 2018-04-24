import handleHitBTCPair from './handleHitBTCPair';
import { rawOrderBooks, monitoredPairs } from '../config/Base';

export default function (rawHitBTCOrderBook) {
  return (message) => {
    const data = JSON.parse(message);

    if (!data.params) return null;

    let pair = data.params.symbol;

    if (pair === 'BTCUSD') pair = 'BTCUSDT';
    if (pair === 'BCHUSD') pair = 'BCHUSDT';

    if (pair && monitoredPairs.indexOf(pair) > -1) {
      return handleHitBTCPair(data, rawHitBTCOrderBook, rawOrderBooks, pair);
    }

    return null;
  };
}
