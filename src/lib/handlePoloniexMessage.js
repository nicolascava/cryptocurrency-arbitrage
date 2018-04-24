import handlePoloniexPair from './handlePoloniexPair';
import { rawPoloniexOrderBook, monitoredPairs } from '../config/Base';

export default function (orderBooks) {
  return (channelName, data) => {
    const pair = channelName ? channelName.split('_')[1] + channelName.split('_')[0] : null;

    if (pair && monitoredPairs.indexOf(pair) > -1) {
      return handlePoloniexPair(data, rawPoloniexOrderBook, orderBooks, pair);
    }

    return null;
  };
}
