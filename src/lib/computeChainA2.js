import {
  balances,
  noBalanceCheck,
  maxQuantityToStartChain,
  disableMaxQuantity,
  disableFees,
  forceOrder1,
} from '../config/Base';
import toFixed from './toFixed';

const chainID = 'A2';

function prepareConfig(item, symbolCurrency, marketCurrency1, marketCurrency2) {
  const exchange1 = item[0].exchangeName;
  const exchange2 = item[1].exchangeName;
  const exchange3 = item[2].exchangeName;

  const exchange1Pair = symbolCurrency + marketCurrency1;
  const exchange2Pair = symbolCurrency + marketCurrency2;
  const exchange3Pair = marketCurrency2 + marketCurrency1;

  const balance1 = balances[exchange1][marketCurrency1];
  const balance2 = balances[exchange2][symbolCurrency];
  const balance3 = balances[exchange3][marketCurrency2];

  const exchange1Fees = item[0].exchangeConfig.fees;
  const exchange2Fees = item[1].exchangeConfig.fees;
  const exchange3Fees = item[2].exchangeConfig.fees;

  const exchange1FeeDecimals = item[0].exchangeConfig.feeDecimals;
  const exchange2FeeDecimals = item[1].exchangeConfig.feeDecimals;
  const exchange3FeeDecimals = item[2].exchangeConfig.feeDecimals;

  const exchange1LotSize = item[0].exchangeConfig.lotSize[exchange1Pair];
  const exchange2LotSize = item[1].exchangeConfig.lotSize[exchange2Pair];
  const exchange3LotSize = item[2].exchangeConfig.lotSize[exchange3Pair];

  const order1 = item[0][exchange1Pair].lowestAsk;
  const order2 = item[1][exchange2Pair].highestBid;
  const order3 = item[2][exchange3Pair].highestBid;

  return {
    balance1,
    balance2,
    balance3,
    exchange1Fees,
    exchange2Fees,
    exchange3Fees,
    exchange1FeeDecimals,
    exchange2FeeDecimals,
    exchange3FeeDecimals,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
    order1,
    order2,
    order3,
  };
}

function findQuantity(
  order1,
  order2,
  order3,
  exchange1LotSize,
  exchange2LotSize,
  exchange3LotSize,
) {
  if (forceOrder1) return order1.quantity;

  let quantity2 = toFixed(order1.quantity, exchange2LotSize.decimals);
  let quantity3 = toFixed(order1.quantity * order2.price, exchange3LotSize.decimals);

  if (order2.quantity >= quantity2 && order3.quantity >= quantity3) {
    return order1.quantity - (1 / (10 ** exchange1LotSize.decimals));
  }

  let quantity1 = toFixed(order2.quantity, exchange1LotSize.decimals);

  quantity3 = toFixed(order2.quantity * order2.price, exchange3LotSize.decimals);

  if (order1.quantity >= quantity1 && order3.quantity >= quantity3) {
    return quantity1 - (1 / (10 ** exchange1LotSize.decimals));
  }

  quantity1 = toFixed(order3.quantity / order2.price, exchange1LotSize.decimals);
  quantity2 = toFixed(quantity1, exchange2LotSize.decimals);

  if (order1.quantity >= quantity1 && order2.quantity >= quantity2) {
    return quantity1 - (1 / (10 ** exchange1LotSize.decimals));
  }

  return null;
}

function findOrder1Quantity(
  order1,
  order2,
  order3,
  balance1,
  exchange1Fees,
  exchange1FeeDecimals,
  exchange1LotSize,
  exchange2LotSize,
  exchange3LotSize,
  symbolCurrency,
) {
  const baseQuantity = findQuantity(
    order1,
    order2,
    order3,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
  );

  if (!baseQuantity) {
    return {
      order1Quantity: null,
      order1QuantityAfterFees: null,
    };
  }

  const threshold = maxQuantityToStartChain[symbolCurrency];
  const orderQuantity = !disableMaxQuantity && baseQuantity > threshold ?
    threshold : baseQuantity;

  const quantityBeforeComputation = !noBalanceCheck && balance1 < orderQuantity * order1.price ?
    balance1 / order1.price : orderQuantity;

  const quantity = toFixed(quantityBeforeComputation, exchange1LotSize.decimals);

  const fees = disableFees ? 0 : toFixed(quantity * exchange1Fees, exchange1FeeDecimals);

  return {
    order1Quantity: quantity,
    order1QuantityAfterFees: quantity - fees,
  };
}

function findOrder2Quantity(
  order1QuantityAfterFees,
  exchange2LotSize,
  order2,
  exchange2Fees,
  exchange2FeeDecimals,
) {
  const quantity = toFixed(order1QuantityAfterFees, exchange2LotSize.decimals);

  const fees = disableFees ? 0 : toFixed((quantity * order2.price) *
    exchange2Fees, exchange2FeeDecimals);

  return {
    order2Quantity: quantity,
    gainAfterOrder2: (quantity * order2.price) - fees,
  };
}

function findOrder3Quantity(
  gainAfterOrder2,
  exchange3LotSize,
) {
  return toFixed(gainAfterOrder2, exchange3LotSize.decimals);
}

function findBalanceChanges(input) {
  const {
    order1Quantity,
    order3Quantity,
    order1,
    order3,
    exchange3Fees,
    exchange3FeeDecimals,
  } = input;

  const gainBeforeFees = order3Quantity * order3.price;
  const gainFees = toFixed(gainBeforeFees * exchange3Fees, exchange3FeeDecimals);
  const gain = gainBeforeFees - gainFees;

  const cost = order1Quantity * order1.price;

  const profit = gain - cost;
  const roi = ((gain - cost) / cost) * 100;

  return {
    gain,
    cost,
    profit,
    roi,
  };
}

function areOrdersInvalid(input) {
  const {
    balance1,
    balance2,
    balance3,
    order1Quantity,
    order2Quantity,
    order3Quantity,
    order1,
    order2,
    order3,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
  } = input;

  // TODO: check funds for fees here.
  if (
    !noBalanceCheck &&
    (
      !balance1 ||
      !balance2 ||
      !balance3 ||
      order1Quantity * order1.price > balance1 ||
      order2Quantity > balance2 ||
      order3Quantity > balance3
    )
  ) {
    return true;
  }

  return (
    order1Quantity === 0 ||
    order2Quantity === 0 ||
    order3Quantity === 0 ||

    order1Quantity > order1.quantity ||
    order2Quantity > order2.quantity ||
    order3Quantity > order3.quantity ||

    order1Quantity < exchange1LotSize.quantity ||
    order2Quantity < exchange2LotSize.quantity ||
    order3Quantity < exchange3LotSize.quantity ||

    order1Quantity * order1.price < exchange1LotSize.orderValue ||
    order2Quantity * order2.price < exchange2LotSize.orderValue ||
    order3Quantity * order3.price < exchange3LotSize.orderValue
  );
}

// Chain A2
//
// buy BCH/BTC => sell BCH/ETH => sell ETH/BTC
export default async function (
  item,
  computedChains,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
) {
  const {
    balance1,
    balance2,
    balance3,
    exchange1Fees,
    exchange2Fees,
    exchange3Fees,
    exchange1FeeDecimals,
    exchange2FeeDecimals,
    exchange3FeeDecimals,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
    order1,
    order2,
    order3,
  } = prepareConfig(item, symbolCurrency, marketCurrency1, marketCurrency2);

  if (!noBalanceCheck && (balance1 === 0 || balance2 === 0 || balance3 === 0)) return null;

  const { order1Quantity, order1QuantityAfterFees } = findOrder1Quantity(
    order1,
    order2,
    order3,
    balance1,
    exchange1Fees,
    exchange1FeeDecimals,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
    symbolCurrency,
  );

  if (!order1Quantity) return null;

  const { order2Quantity, gainAfterOrder2 } = findOrder2Quantity(
    order1QuantityAfterFees,
    exchange2LotSize,
    order2,
    exchange2Fees,
    exchange2FeeDecimals,
  );

  const order3Quantity = findOrder3Quantity(
    gainAfterOrder2,
    exchange3LotSize,
  );

  const isInvalid = areOrdersInvalid({
    balance1,
    balance2,
    balance3,
    order1Quantity,
    order2Quantity,
    order3Quantity,
    order1,
    order2,
    order3,
    exchange1LotSize,
    exchange2LotSize,
    exchange3LotSize,
  });

  if (isInvalid) return null;

  const {
    roi,
    profit,
    gain,
    cost,
  } = findBalanceChanges({
    order1Quantity,
    order3Quantity,
    order1,
    order3,
    exchange3Fees,
    exchange3FeeDecimals,
  });

  computedChains.push({
    order1,
    order2,
    order3,
    exchange1: item[0].exchangeConfig,
    exchange2: item[1].exchangeConfig,
    exchange3: item[2].exchangeConfig,
    order1Quantity,
    order2Quantity,
    order3Quantity,
    gainAfterOrder2,
    gain,
    cost,
    profit,
    roi,
    chainID,
  });

  return null;
}
