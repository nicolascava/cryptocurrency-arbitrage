import WebSocket from 'ws';

import handleOKExError from './handleOKExError';
import handleOKExOpen from './handleOKExOpen';
import { rawOrderBooks } from '../config/Base';
import handleOKExMessage from './handleOKExMessage';

export default function () {
  const okexWS = new WebSocket('wss://real.okex.com:10440/websocket/okexapi');

  okexWS.on('open', handleOKExOpen(okexWS));
  okexWS.on('message', handleOKExMessage(rawOrderBooks));
  okexWS.on('error', handleOKExError);
}
