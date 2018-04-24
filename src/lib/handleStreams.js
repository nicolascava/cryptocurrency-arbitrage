import handleHitBTCStream from './handleHitBTCStream';
import handlePoloniexStream from './handlePoloniexStream';
import handleBinanceStream from './handleBinanceStream';
import handleOKExStream from './handleOKExStream';
import handleHuobiStream from './handleHuobiStream';
import handleBitfinexStream from './handleBitfinexStream';
import { supportedExchanges } from '../config/Base';

// TODO: handle multiple chains with all exchanges.
export default function () {
  if (supportedExchanges.indexOf('Poloniex') > -1) handlePoloniexStream();
  if (supportedExchanges.indexOf('Binance') > -1) handleBinanceStream();
  if (supportedExchanges.indexOf('HitBTC') > -1) handleHitBTCStream();
  if (supportedExchanges.indexOf('OKEx') > -1) handleOKExStream();
  if (supportedExchanges.indexOf('Huobi') > -1) handleHuobiStream();
  if (supportedExchanges.indexOf('Bitfinex') > -1) handleBitfinexStream();
}
