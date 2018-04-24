import winston from 'winston';
import chalk from 'chalk';
import _ from 'lodash';

import outputToConsole from './outputToConsole';
import handleTradeError from './handleTradeError';
import {
  disableTrading,
  roiThreshold,
  chainLastPrices,
  onlyOutputProfits,
  throttleLogs,
  nonInstantOrders,
  timeoutAfterTrade,
} from '../config/Base';
import trade from './trade';
import hydrateChainLastPrices from './hydrateChainLastPrices';
import prepareBestChain from './prepareBestChain';
import timeout from './timeout';

let tradeInProgress = false;

async function handleTradeFeedback(status) {
  winston.info(chalk.yellow(`Waiting ${timeoutAfterTrade / 1000}s until enabling trading ' +
    'again. If needed, you can use this delay to shutdown PAM`));

  await timeout(timeoutAfterTrade);

  nonInstantOrders.length = 0;
  tradeInProgress = status;
}

async function resolveChain(orderBooks, currency, sum) {
  const mutableSum = sum;
  const {
    bestChain,
    chains,
    permutations,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
  } = await prepareBestChain(
    orderBooks,
    {
      symbolCurrency: currency.symbolCurrency,
      marketCurrency1: currency.marketCurrency1,
      marketCurrency2: currency.marketCurrency2,
      secondSymbolCurrency: currency.secondSymbolCurrency || null,
    },
  );

  mutableSum.permutations += permutations.length;
  mutableSum.chains += chains.length;

  return {
    bestChain,
    chains,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
  };
}

function resolveChains(orderBooks, currencies, sum) {
  return new Promise((resolve) => {
    const chains = [];

    let resolvedChains = 0;

    for (let index = 0; index < currencies.length; index += 1) {
      resolveChain(orderBooks, currencies[index], sum)
        // eslint-disable-next-line no-loop-func
        .then((data) => {
          chains.push(data);

          resolvedChains += 1;

          if (resolvedChains === currencies.length) resolve(chains);
        });
    }
  });
}

export default async function (orderBooks, currencies) {
  const sum = {
    permutations: 0,
    chains: 0,
  };

  const bestChains = await resolveChains(orderBooks, currencies, sum);

  if (!bestChains || bestChains.length === 0) return null;

  const {
    bestChain,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  } = _.orderBy(bestChains, ['profit'], ['desc'])[0];

  if (!bestChain) return null;

  bestChain.permutationsSum = sum.permutations;
  bestChain.chainsSum = sum.chains;

  const chainIDKey = `chain${bestChain.chainID}`;
  const chainLastPricesID = symbolCurrency + marketCurrency1 + marketCurrency2 +
    (secondSymbolCurrency || '');
  const currentChainLastPrices = chainLastPrices[chainLastPricesID][chainIDKey];

  // If last chain prices are the same as the current one, kill scenario.
  // TODO: check if it's the best way to prevent spamming.
  if (
    throttleLogs &&
    currentChainLastPrices.price1 === bestChain.order1.price &&
    currentChainLastPrices.price2 === bestChain.order2.price &&
    currentChainLastPrices.price3 === bestChain.order3.price &&
    (
      (secondSymbolCurrency && currentChainLastPrices.price4 === bestChain.order4.price) ||
      !secondSymbolCurrency
    )
  ) {
    return null;
  }

  // Save current chain prices to prevent monitoring the same prices twice or more.
  hydrateChainLastPrices(
    bestChain,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  );

  // Console monitoring logging.
  if (!tradeInProgress) {
    if (bestChain.profit > 0) {
      outputToConsole(
        bestChain,
        symbolCurrency,
        marketCurrency1,
        marketCurrency2,
        secondSymbolCurrency,
        true,
      );
    } else if (!onlyOutputProfits) {
      outputToConsole(
        bestChain,
        symbolCurrency,
        marketCurrency1,
        marketCurrency2,
        secondSymbolCurrency,
      );
    }
  }

  // TODO: remove this when everything is good.
  if (secondSymbolCurrency) return null;

  // If we make more profit than the threshold, and no trade is in progress, we will place
  // orders.
  if (
    !disableTrading &&
    bestChain.roi > roiThreshold &&
    bestChain.profit > 0 &&
    !tradeInProgress
  ) {
    tradeInProgress = true;

    // Running orders then log trade.
    trade(bestChain, symbolCurrency, marketCurrency1, marketCurrency2)
      .then(handleTradeFeedback)
      .catch(handleTradeError);
  }

  return null;
}
