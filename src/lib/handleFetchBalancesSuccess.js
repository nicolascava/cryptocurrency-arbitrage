import _ from 'lodash';
import fs from 'fs';

import {
  balances,
  filteredExchanges,
  previousBalances,
  baseBalancesFilePath,
} from '../config/Base';
import processBalancesDiff from './processBalancesDiff';

export default async function (input) {
  const {
    exchange,
    data,
    requestsDone,
    bestChain,
    resolve,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
  } = input;

  balances[exchange.name] = data;

  if (requestsDone === filteredExchanges.length) {
    if (!_.isEmpty(previousBalances)) {
      return processBalancesDiff(
        bestChain,
        symbolCurrency,
        marketCurrency1,
        marketCurrency2,
        resolve,
      );
    }

    const baseBalancesFile = JSON.parse(fs.readFileSync(baseBalancesFilePath));

    // TODO: not scaling well.
    if (_.isEmpty(baseBalancesFile)) {
      let ethBalance = 0;
      let btcBalance = 0;
      let bchBalance = 0;
      let omgBalance = 0;

      Object.keys(balances).forEach((exchangeName) => {
        ethBalance += balances[exchangeName].ETH;
        btcBalance += balances[exchangeName].BTC;
        bchBalance += balances[exchangeName].BCH;
        omgBalance += balances[exchangeName].OMG;
      });

      fs.writeFileSync(baseBalancesFilePath, JSON.stringify({
        ETH: ethBalance,
        BTC: btcBalance,
        BCH: bchBalance,
        OMG: omgBalance,
      }));
    }

    return resolve();
  }

  return null;
}
