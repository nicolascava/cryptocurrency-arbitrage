export default function (okexWS) {
  return () => {
    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_usdt_depth_50',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_btc_depth_50',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_btc_usdt_depth_50',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_eth_depth_50',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_eth_btc_depth_50',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_usdt_depth',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_btc_depth',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_btc_usdt_depth',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_eth_btc_depth',
    }));

    okexWS.send(JSON.stringify({
      event: 'addChannel',
      channel: 'ok_sub_spot_bch_eth_depth',
    }));
  };
}
