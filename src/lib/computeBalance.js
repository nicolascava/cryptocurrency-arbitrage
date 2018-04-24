import { balances } from '../config/Base';

export default function (computedBalances) {
  return (exchangeName) => {
    const mutableComputedBalances = computedBalances;
    const newBalances = {};

    // TODO: automatize this.
    ['BTC', 'ETH', 'BCH', 'OMG'].forEach((currency) => {
      newBalances[currency] = balances[exchangeName][currency];
    });

    mutableComputedBalances[exchangeName] = newBalances;
  };
}
