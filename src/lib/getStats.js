import moment from 'moment';
import fs from 'fs';
import _ from 'lodash';

import { filePath } from '../config/Base';
import toFixed from './toFixed';

export default function (req, res) {
  const results = JSON.parse(fs.readFileSync(filePath));

  if (results.trades.length === 0) {
    return res.send({
      data: [],
    });
  }

  const { start } = results;
  const startTrade = results.trades[0].timestamp;
  const end = results.trades[results.trades.length - 1].timestamp;
  const now = Date.now();
  const difference = moment.duration(moment(now).diff(moment(start)));
  const differenceAsHours = difference.asHours();
  const orderedTrades = _.orderBy(results.trades, ['profit'], ['desc']);
  const bestTrade = orderedTrades[0];

  let profit = 0;

  results.trades.forEach((currentTrade) => {
    profit += currentTrade.profit;
  });

  return res.send({
    data: [{
      firstTradeAt: moment(startTrade).utcOffset(-5).format('YYYY-MM-DD HH:mm'),
      lastTradeAt: moment(end).utcOffset(-5).format('YYYY-MM-DD HH:mm'),
      hoursSinceStart: toFixed(differenceAsHours, 2),
      profit: toFixed(profit, 8),
      profitByHour: toFixed((profit / differenceAsHours), 8),
      tradesByHour: toFixed((results.trades.length / differenceAsHours), 2),
      numberOfTrades: results.trades.length,
      bestTrade: {
        profit: toFixed(bestTrade.profit, 8),
        tradedAt: moment(bestTrade.timestamp).utcOffset(-5).format('YYYY-MM-DD HH:mm'),
      },
      currentBalances: results.balances,
    }],
  });
}
