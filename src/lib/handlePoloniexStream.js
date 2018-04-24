import Poloniex from 'poloniex-api-node';

import handlePoloniexMessage from './handlePoloniexMessage';
import { rawOrderBooks } from '../config/Base';
import handlePoloniexError from './handlePoloniexError';
import handlePoloniexClose from './handlePoloniexClose';

export default function () {
  const poloniex = new Poloniex();

  poloniex.subscribe('BTC_BCH');
  poloniex.subscribe('BTC_ETH');
  poloniex.subscribe('BTC_OMG');

  poloniex.subscribe('ETH_BCH');
  poloniex.subscribe('ETH_OMG');

  poloniex.on('message', handlePoloniexMessage(rawOrderBooks));
  poloniex.on('close', handlePoloniexClose(poloniex));
  poloniex.on('error', handlePoloniexError);

  poloniex.openWebSocket({ version: 2 });
}
