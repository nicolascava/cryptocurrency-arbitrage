import handleBitfinexMessage from './handleBitfinexMessage';
import { initWebSocketConnection } from '../exchanges/bitfinex';

export default function () {
  const ws = initWebSocketConnection();

  ws.onOrderBook({ symbol: 'tETHBTC' }, handleBitfinexMessage('ETHBTC'));
  ws.onOrderBook({ symbol: 'tBCHBTC' }, handleBitfinexMessage('BCHBTC'));
  ws.onOrderBook({ symbol: 'tOMGBTC' }, handleBitfinexMessage('OMGBTC'));
  ws.onOrderBook({ symbol: 'tBCHETH' }, handleBitfinexMessage('BCHETH'));
  ws.onOrderBook({ symbol: 'tOMGETH' }, handleBitfinexMessage('OMGETH'));
}
