export default function (hitBTCWS) {
  return () => {
    hitBTCWS.send(JSON.stringify({
      method: 'subscribeOrderbook',
      params: {
        symbol: 'BCHUSD',
      },
    }));

    hitBTCWS.send(JSON.stringify({
      method: 'subscribeOrderbook',
      params: {
        symbol: 'BCHBTC',
      },
    }));

    hitBTCWS.send(JSON.stringify({
      method: 'subscribeOrderbook',
      params: {
        symbol: 'BTCUSD',
      },
    }));

    hitBTCWS.send(JSON.stringify({
      method: 'subscribeOrderbook',
      params: {
        symbol: 'BCHETH',
      },
    }));

    hitBTCWS.send(JSON.stringify({
      method: 'subscribeOrderbook',
      params: {
        symbol: 'ETHBTC',
      },
    }));
  };
}
