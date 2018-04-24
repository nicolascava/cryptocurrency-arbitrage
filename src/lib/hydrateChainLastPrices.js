import { chainLastPrices } from '../config/Base';

export default function (
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency,
) {
  const sequence = symbolCurrency + marketCurrency1 + marketCurrency2 +
    (secondSymbolCurrency || '');
  const chainIDKey = `chain${bestChain.chainID}`;

  chainLastPrices[sequence][chainIDKey].price1 = bestChain.order1.price;
  chainLastPrices[sequence][chainIDKey].price2 = bestChain.order2.price;
  chainLastPrices[sequence][chainIDKey].price3 = bestChain.order3.price;

  if (secondSymbolCurrency) {
    chainLastPrices[sequence][chainIDKey].price4 = bestChain.order4.price;
  }
}
