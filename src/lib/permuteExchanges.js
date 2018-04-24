import combinatorics from 'js-combinatorics';

export default function (exchanges, secondSymbolCurrency) {
  const combinations = secondSymbolCurrency ? 4 : 3;
  const baseN = combinatorics.baseN(exchanges, combinations);

  return baseN.toArray();
}
