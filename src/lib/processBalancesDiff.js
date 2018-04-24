import request from 'request';
import fs from 'fs';
import winston from 'winston';
import chalk from 'chalk';

import prepareNewAndOldAmounts from './prepareNewAndOldAmounts';
import {
  balances,
  filePath,
  tradesChannelURL,
  privateTradesChannelURL,
  enablePrivateLogs,
  disableSlackLogs,
  nonInstantOrders,
  usdPrices,
} from '../config/Base';
import computeBalance from './computeBalance';
import outputBalancesDiffToConsole from './outputBalancesDiffToConsole';
import toFixed from './toFixed';

let lastRequest = null;

function getPricesInUSD() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      url: 'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=50',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (lastRequest && lastRequest > Date.now() + 60000) return resolve(usdPrices);

    const runningRequest = request(options, (error, response, body) => {
      runningRequest.end();

      const parsedBody = JSON.parse(body);

      parsedBody.forEach((item) => {
        usdPrices[item.symbol] = parseFloat(item.price_usd);
      });

      lastRequest = Date.now();

      return resolve(usdPrices);
    });

    return null;
  });
}

export default async function (
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  resolve,
) {
  winston.info(chalk.yellow('Processing balances difference'));

  const options = {
    url: enablePrivateLogs ? privateTradesChannelURL : tradesChannelURL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const tradesFile = JSON.parse(fs.readFileSync(filePath));
  const computedBalances = {};

  const {
    newSymbolCurrencyAmount,
    newMarket1CurrencyAmount,
    newMarket2CurrencyAmount,
    oldSymbolCurrencyAmount,
    oldMarket1CurrencyAmount,
    oldMarket2CurrencyAmount,
  } = prepareNewAndOldAmounts(symbolCurrency, marketCurrency1, marketCurrency2);

  const pricesInUSD = await getPricesInUSD();

  const symbolCurrencyDifference = newSymbolCurrencyAmount - oldSymbolCurrencyAmount;
  const marketCurrency1Difference = newMarket1CurrencyAmount - oldMarket1CurrencyAmount;
  const marketCurrency2Difference = newMarket2CurrencyAmount - oldMarket2CurrencyAmount;

  const market1Sign = marketCurrency1Difference > 0 ? '+' : '';
  const market2Sign = marketCurrency2Difference > 0 ? '+' : '';
  const symbolSign = symbolCurrencyDifference > 0 ? '+' : '';

  const usdROI = marketCurrency1Difference * pricesInUSD[marketCurrency1];

  const color = usdROI > 0 ? '#4CAF50' : '#F44336';

  let chain = null;

  switch (bestChain.chainID) {
    case 'A2':
      chain = `Chain *${bestChain.chainID}*: *buy ${symbolCurrency}/${marketCurrency1}*` +
        ` on *${bestChain.exchange1.name}* => *sell ${symbolCurrency}/${marketCurrency2}*` +
        ` on *${bestChain.exchange2.name}* => *sell ${marketCurrency2}/${marketCurrency1}*` +
        ` on *${bestChain.exchange3.name}*`;
      break;
    case 'A3':
      chain = `Chain *${bestChain.chainID}*: *sell ${marketCurrency2}/${marketCurrency1}*` +
        ` on *${bestChain.exchange1.name}* => *sell ${symbolCurrency}/${marketCurrency2}*` +
        ` on *${bestChain.exchange2.name}* => *buy ${symbolCurrency}/${marketCurrency1}*` +
        ` on *${bestChain.exchange3.name}*`;
      break;
    case 'A4':
      chain = `Chain *${bestChain.chainID}*: *sell ${symbolCurrency}/${marketCurrency1}*` +
        ` on *${bestChain.exchange1.name}* => *buy ${symbolCurrency}/${marketCurrency2}*` +
        ` on *${bestChain.exchange2.name}* => *buy ${marketCurrency2}/${marketCurrency1}*` +
        ` on *${bestChain.exchange3.name}*`;
      break;
    default:
      chain = `Chain *${bestChain.chainID}*: *buy ${marketCurrency2}/${marketCurrency1}*` +
        ` on *${bestChain.exchange1.name}* => *buy ${symbolCurrency}/${marketCurrency2}*` +
        ` on *${bestChain.exchange2.name}* => *sell ${symbolCurrency}/${marketCurrency1}*` +
        ` on *${bestChain.exchange3.name}*`;
  }

  const text = `PAM!\n${chain}`;

  const attachments = [
    {
      color,
      fields: [
        {
          title: 'ROI (USD)',
          value: `${toFixed(usdROI, 4)} USD`,
          short: true,
        },
      ],
    },
    {
      color: '#E0E0E0',
      fields: [
        {
          title: `${marketCurrency1} difference`,
          value: market1Sign + toFixed(marketCurrency1Difference, 8),
          short: true,
        },
        {
          title: `${marketCurrency2} difference`,
          value: market2Sign + toFixed(marketCurrency2Difference, 8),
          short: true,
        },
        {
          title: `${symbolCurrency} difference`,
          value: symbolSign + toFixed(symbolCurrencyDifference, 8),
          short: true,
        },
      ],
    },
    {
      color: '#E0E0E0',
      fields: [
        {
          title: `Overall ${marketCurrency1} balance`,
          value: `${newMarket1CurrencyAmount} ${marketCurrency1}`,
          short: true,
        },
        {
          title: `Overall ${marketCurrency2} balance`,
          value: `${newMarket2CurrencyAmount} ${marketCurrency2}`,
          short: true,
        },
        {
          title: `Overall ${symbolCurrency} balance`,
          value: `${newSymbolCurrencyAmount} ${symbolCurrency}`,
          short: true,
        },
      ],
    },
  ];

  const body = { text, attachments };

  if (nonInstantOrders.length > 0) {
    let ordersText = null;

    if (nonInstantOrders.length > 1) {
      ordersText = `*Order ${nonInstantOrders.sort().join(', order ')}* were not` +
        ' taken instantly which can cause some loss.';
    } else {
      ordersText = `*Order ${nonInstantOrders.sort().join(', order ')}* was not` +
        ' taken instantly which can cause some loss.';
    }

    body.attachments.push({
      color: '#FFEB3B',
      text: ordersText,
    });
  }

  options.body = JSON.stringify(body);

  outputBalancesDiffToConsole({
    newMarket1CurrencyAmount,
    newMarket2CurrencyAmount,
    newSymbolCurrencyAmount,
    market1Sign,
    marketCurrency1Difference,
    market2Sign,
    marketCurrency2Difference,
    symbolSign,
    symbolCurrencyDifference,
    symbolCurrency,
    marketCurrency1,
    marketCurrency2,
  });

  Object.keys(balances)
    .forEach(computeBalance(computedBalances, symbolCurrency, marketCurrency1, marketCurrency2));

  const tradeLog = {
    timestamp: Date.now(),
    balances: computedBalances,
    profit: toFixed(marketCurrency1Difference, 8),
  };

  tradesFile.trades.push(tradeLog);
  tradesFile.balances = computedBalances;

  fs.writeFileSync(filePath, JSON.stringify(tradesFile));

  if (disableSlackLogs) return resolve();

  const runningRequest = request(options, () => {
    runningRequest.end();

    return resolve();
  });

  return null;
}
