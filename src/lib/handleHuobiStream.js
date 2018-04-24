import WebSocket from 'ws';
import pako from 'pako';
import winston from 'winston';

import { rawOrderBooks, monitoredPairs } from '../config/Base';
import checkChain from './checkChain';

function handleHuobiPair(pair, parsedData) {
  const formattedAsks = parsedData.tick.asks.map(item => ({
    price: parseFloat(item[0]),
    quantity: parseFloat(item[1]),
  }));
  const formattedBids = parsedData.tick.bids.map(item => ({
    price: parseFloat(item[0]),
    quantity: parseFloat(item[1]),
  }));

  rawOrderBooks.Huobi[pair].lowestAsk.price = formattedAsks[0].price;
  rawOrderBooks.Huobi[pair].lowestAsk.quantity = formattedAsks[0].quantity;

  rawOrderBooks.Huobi[pair].highestBid.price = formattedBids[0].price;
  rawOrderBooks.Huobi[pair].highestBid.quantity = formattedBids[0].quantity;

  rawOrderBooks.Huobi[pair].asks = formattedAsks;
  rawOrderBooks.Huobi[pair].bids = formattedBids;

  rawOrderBooks.Huobi[pair].init = true;

  checkChain(rawOrderBooks);
}

function handleHuobiOpen(ws) {
  return () => {
    ws.send(JSON.stringify({
      sub: 'market.bchusdt.depth.step0',
    }));

    ws.send(JSON.stringify({
      sub: 'market.bchbtc.depth.step0',
    }));

    ws.send(JSON.stringify({
      sub: 'market.btcusdt.depth.step0',
    }));

    ws.send(JSON.stringify({
      sub: 'market.ethbtc.depth.step0',
    }));
  };
}

function handleHuobiMessage(data) {
  const parsedData = JSON.parse(pako.inflate(data, { to: 'string' }));

  if (!parsedData.ch) return null;

  const channel = parsedData.ch;

  let pair = null;

  if (channel === 'market.bchusdt.depth.step0') pair = 'BCHUSDT';
  if (channel === 'market.btcusdt.depth.step0') pair = 'BTCUSDT';
  if (channel === 'market.bchbtc.depth.step0') pair = 'BCHBTC';
  if (channel === 'market.ethbtc.depth.step0') pair = 'ETHBTC';

  if (pair && monitoredPairs.indexOf(pair) > -1) return handleHuobiPair(pair, parsedData);

  return null;
}

function handleHuobiError(error) {
  winston.info(error);
}

function handleHuobiClose(action) {
  return () => action();
}

function connectToHuobiStream() {
  const ws = new WebSocket('wss://api.huobi.pro/ws');

  ws.on('open', handleHuobiOpen(ws));
  ws.on('message', handleHuobiMessage);
  ws.on('error', handleHuobiError);
  ws.on('close', handleHuobiClose(connectToHuobiStream));
}

export default function () {
  connectToHuobiStream();
}
