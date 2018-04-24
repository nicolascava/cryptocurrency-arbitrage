import _ from 'lodash';

import { filteredExchanges } from '../config/Base';

export default function (
  exchanges,
  orderBooks,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency,
) {
  return (exchangeName) => {
    if (
      !orderBooks[exchangeName][marketCurrency2 + marketCurrency1].init ||
      !orderBooks[exchangeName][symbolCurrency + marketCurrency2].init ||
      !orderBooks[exchangeName][symbolCurrency + marketCurrency1].init
    ) {
      return null;
    }

    if (
      secondSymbolCurrency && (
        !orderBooks[exchangeName][secondSymbolCurrency + marketCurrency2].init ||
        !orderBooks[exchangeName][secondSymbolCurrency + marketCurrency1].init
      )
    ) {
      return null;
    }

    return exchanges.push({
      ...orderBooks[exchangeName],
      exchangeName,
      exchangeConfig: _.find(filteredExchanges, { name: exchangeName }),
    });
  };
}
