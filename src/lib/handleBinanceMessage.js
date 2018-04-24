import handleBinancePair from './handleBinancePair';
import { monitoredPairs } from '../config/Base';

export default function (orderBooks) {
  return (symbol, depth) => {
    let pair = symbol;

    if (pair === 'BCCUSDT') pair = 'BCHUSDT';
    if (pair === 'BCCBTC') pair = 'BCHBTC';
    if (pair === 'BCCETH') pair = 'BCHETH';

    if (pair && monitoredPairs.indexOf(pair) > -1) {
      return handleBinancePair(orderBooks, depth, pair);
    }

    return null;
  };
}
