import binance from 'node-binance-api';

import { rawOrderBooks } from '../config/Base';
import handleBinanceMessage from './handleBinanceMessage';

export default function () {
  const binancePairs = ['BTCUSDT', 'BCCBTC', 'BCCUSDT', 'BCCETH', 'ETHBTC', 'ETCBTC', 'ETCETH'];

  binance.websockets.depthCache(binancePairs, handleBinanceMessage(rawOrderBooks));
}
