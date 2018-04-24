import WebSocket from 'ws';

import handleHitBTCOpen from './handleHitBTCOpen';
import { rawOrderBooks, rawHitBTCOrderBook } from '../config/Base';
import handleHitBTCMessage from './handleHitBTCMessage';

export default function () {
  const hitBTCWS = new WebSocket('wss://api.hitbtc.com/api/2/ws');

  hitBTCWS.on('open', handleHitBTCOpen(hitBTCWS));
  hitBTCWS.on('message', handleHitBTCMessage(rawHitBTCOrderBook, rawOrderBooks));
}
