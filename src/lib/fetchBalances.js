import { filteredExchanges, timeoutToPreventSyncIssues } from '../config/Base';
import rejectFetchBalancesError from './rejectFetchBalancesError';
import handleFetchBalancesSuccess from './handleFetchBalancesSuccess';
import timeout from './timeout';

// Hydrate a centralized object that can be use across the app to know about how many funds
// we have.
export default function fetchBalances(
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  afterTrade = false,
) {
  return new Promise(async (resolve, reject) => {
    let requestsDone = 0;

    return filteredExchanges.forEach(async (exchange) => {
      if (!exchange.balances) return null;

      // Workaround for balances that are not sync yet.
      if (afterTrade) {
        await timeout(timeoutToPreventSyncIssues);
      }

      return exchange
        .balances()
        .then(async (data) => {
          requestsDone += 1;

          return handleFetchBalancesSuccess({
            exchange,
            data,
            requestsDone,
            bestChain,
            resolve,
            symbolCurrency,
            marketCurrency1,
            marketCurrency2,
          });
        })
        .catch(rejectFetchBalancesError(reject));
    });
  });
}
