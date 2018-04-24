import _ from 'lodash';

import setupExchangeObject from './setupExchangeObject';
import permuteExchanges from './permuteExchanges';
import computeChainA1 from './computeChainA1';
import computeChainA2 from './computeChainA2';
import computeChainA3 from './computeChainA3';
import computeChainA4 from './computeChainA4';
import computeChainB1 from './computeChainB1';

function resolveChain(
  permutations,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency,
) {
  return new Promise((resolve) => {
    const computedChains = [];

    let computeFunctions = [];

    if (!secondSymbolCurrency) {
      computeFunctions = computeFunctions.concat([
        computeChainA1,
        computeChainA2,
        computeChainA3,
        computeChainA4,
      ]);
    }

    if (secondSymbolCurrency) computeFunctions.push(computeChainB1);

    let resolvedChains = 0;

    for (let index = 0; index < permutations.length; index += 1) {
      for (let j = 0; j < computeFunctions.length; j += 1) {
        computeFunctions[j](
          permutations[index],
          computedChains,
          symbolCurrency,
          marketCurrency1,
          marketCurrency2,
          secondSymbolCurrency,
        )
          // eslint-disable-next-line no-loop-func
          .then(() => {
            resolvedChains += 1;

            if (resolvedChains === computeFunctions.length * permutations.length) {
              resolve(computedChains);
            }
          });
      }
    }
  });
}

export default async function (
  orderBooks,
  {
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  },
) {
  const exchanges = [];

  // Setup exchange objects.
  Object.keys(orderBooks).forEach(setupExchangeObject(
    exchanges,
    orderBooks,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  ));

  // Find every permutations of the given exchanges.
  // We need to find the maximum of chains that we can monitor.
  const permutations = permuteExchanges(exchanges, secondSymbolCurrency);

  const computedChains = await resolveChain(
    permutations,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  );

  // Order chains from the greatest ROI to the lowest.
  const chains = _.orderBy(computedChains, ['profit'], ['desc']);

  return {
    bestChain: chains[0],
    permutations,
    chains,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
    secondSymbolCurrency,
  };
}
