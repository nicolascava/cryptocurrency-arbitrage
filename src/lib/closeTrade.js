import { balances, previousBalances } from '../config/Base';
import fetchBalances from './fetchBalances';

export default async function (
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  resolve,
) {
  Object.keys(balances).forEach((key) => {
    previousBalances[key] = balances[key];
  });

  await fetchBalances(bestChain, symbolCurrency, marketCurrency1, marketCurrency2, true)
    .catch(() => {});

  return resolve(false);
}
