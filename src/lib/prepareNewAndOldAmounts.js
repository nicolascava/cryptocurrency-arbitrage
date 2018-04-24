import { balances, previousBalances } from '../config/Base';

export default function (symbolCurrency, marketCurrency1, marketCurrency2) {
  let newSymbolCurrencyAmount = 0;
  let newMarket1CurrencyAmount = 0;
  let newMarket2CurrencyAmount = 0;
  let oldSymbolCurrencyAmount = 0;
  let oldMarket1CurrencyAmount = 0;
  let oldMarket2CurrencyAmount = 0;

  Object.keys(balances).forEach((key) => {
    newSymbolCurrencyAmount += balances[key][symbolCurrency];
    newMarket1CurrencyAmount += balances[key][marketCurrency1];
    newMarket2CurrencyAmount += balances[key][marketCurrency2];
  });

  Object.keys(previousBalances).forEach((key) => {
    oldSymbolCurrencyAmount += previousBalances[key][symbolCurrency];
    oldMarket1CurrencyAmount += previousBalances[key][marketCurrency1];
    oldMarket2CurrencyAmount += previousBalances[key][marketCurrency2];
  });

  return {
    newSymbolCurrencyAmount,
    newMarket1CurrencyAmount,
    newMarket2CurrencyAmount,
    oldSymbolCurrencyAmount,
    oldMarket1CurrencyAmount,
    oldMarket2CurrencyAmount,
  };
}
