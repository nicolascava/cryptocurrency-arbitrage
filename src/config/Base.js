import _ from 'lodash';
import path from 'path';

import {
  getBalances as getPoloniexBalances,
  buy as buyOnPoloniex,
  sell as sellOnPoloniex,
  getOpenOrders as getPoloniexOpenOrders,
  cancelOrder as cancelOrderOnPoloniex,
} from '../exchanges/poloniex';
import {
  getBalances as getBitfinexBalances,
  buy as buyOnBitfinex,
  sell as sellOnBitfinex,
  getOpenOrders as getBitfinexOpenOrders,
  cancelOrder as cancelOrderOnBitfinex,
} from '../exchanges/bitfinex';
import {
  buy as buyOnBinance,
  getBalances as getBinanceBalances,
  sell as sellOnBinance,
  getOpenOrders as getBinanceOpenOrders,
  cancelOrder as cancelOrderOnBinance,
} from '../exchanges/binance';
import {
  getBalances as getOKExBalances,
  buy as buyOnOKEx,
  sell as sellOnOKEx,
  getOpenOrders as getOKExOpenOrders,
  cancelOrder as cancelOrderOnOKEx,
} from '../exchanges/okex';
import filterExchange from '../lib/filterExchange';
import resolveBooleanStringVar from '../lib/resolveBooleanStringVar';

// Credentials

export const poloniexAPIKey = process.env.POLONIEX_API_KEY || null;
export const poloniexSecret = process.env.POLONIEX_SECRET || null;
export const binanceAPIKey = process.env.BINANCE_API_KEY || null;
export const binanceSecret = process.env.BINANCE_SECRET || null;
export const okexAPIKey = process.env.OKEX_API_KEY || null;
export const okexSecret = process.env.OKEX_SECRET || null;
export const bitfinexAPIKey = process.env.BITFINEX_API_KEY || null;
export const bitfinexSecret = process.env.BITFINEX_SECRET || null;

// Feature toggles

export const disableTrading = resolveBooleanStringVar(process.env.DISABLE_TRADING, false);
export const disableSlackLogs = resolveBooleanStringVar(process.env.DISABLE_SLACK_LOGS, false);
export const onlyOutputProfits = resolveBooleanStringVar(process.env.ONLY_OUTPUT_PROFITS, false);
export const noBalanceCheck = resolveBooleanStringVar(process.env.NO_BALANCE_CHECK, false);
export const throttleLogs = resolveBooleanStringVar(process.env.THROTTLE_LOGS, true);
export const enablePrivateLogs = resolveBooleanStringVar(process.env.ENABLE_PRIVATE_LOGS, false);
export const disableMaxQuantity = resolveBooleanStringVar(process.env.DISABLE_MAX_QUANTITY, true);
export const disableFees = resolveBooleanStringVar(process.env.DISABLE_FEES, true);
export const forceOrder1 = resolveBooleanStringVar(process.env.FORCE_ORDER_1, false);
export const use4Nodes = resolveBooleanStringVar(process.env.USE_4_NODES, false);

// Timers

export const checkOrderLimit = 20000;
export const recvWindow = 10000000000000;
export const abortRequestTimeout = 5000;
export const timeoutAfterTrade = 5000;
export const timeoutToPreventSyncIssues = 5000;

// Thresholds

export const roiThreshold = process.env.PROFIT_THRESHOLD ?
  parseFloat(process.env.PROFIT_THRESHOLD) : 0;
export const maxQuantityToStartChain = {
  BCH: 0.8,
  ETH: 1.5,
  OMG: 5,
};

// Centralized configurations

export const binanceConfig = {};
export const chainLastPrices = {};
export const filePath = path.resolve(__dirname, './data/trades.json');
export const baseBalancesFilePath = path.resolve(__dirname, './data/base-balances.json');
export const nonInstantOrders = [];
export const usdPrices = {};

// Order book miscellaneous

export const okexOrderBookInit = {};
export const rawOrderBooks = {};
export const rawOKExOrderBook = {};
export const rawPoloniexOrderBook = {};
export const rawHitBTCOrderBook = {};

// Balances

export const balances = {};
export const previousBalances = {};

// Server configuration

export const port = 3000;

// Currencies and pairs

export const currencies = [
  {
    symbolCurrency: 'BCH',
    marketCurrency1: 'BTC',
    marketCurrency2: 'ETH',
  },
  {
    symbolCurrency: 'OMG',
    marketCurrency1: 'BTC',
    marketCurrency2: 'ETH',
  },
];

if (use4Nodes) {
  const nodes = [
    {
      symbolCurrency: 'BCH',
      marketCurrency1: 'BTC',
      marketCurrency2: 'ETH',
      secondSymbolCurrency: 'OMG',
    },
    {
      symbolCurrency: 'OMG',
      marketCurrency1: 'BTC',
      marketCurrency2: 'ETH',
      secondSymbolCurrency: 'BCH',
    },
  ];

  nodes.forEach(node => currencies.push(node));
}

currencies.forEach((item) => {
  const currenciesSum = item.symbolCurrency + item.marketCurrency1 + item.marketCurrency2 +
    (item.secondSymbolCurrency || '');

  chainLastPrices[currenciesSum] = {
    chainA1: {
      price1: 0,
      price2: 0,
      price3: 0,
    },
    chainA2: {
      price1: 0,
      price2: 0,
      price3: 0,
    },
    chainA3: {
      price1: 0,
      price2: 0,
      price3: 0,
    },
    chainA4: {
      price1: 0,
      price2: 0,
      price3: 0,
    },
    chainB1: {
      price1: 0,
      price2: 0,
      price3: 0,
      price4: 0,
    },
  };
});

export const monitoredPairs = [
  'ETHBTC',
  'BCHETH',
  'BCHBTC',
  'OMGBTC',
  'OMGETH',
];

// Feeding order books with some structure.
monitoredPairs.forEach((monitoredPair) => {
  rawOKExOrderBook[monitoredPair] = {
    asks: [],
    bids: [],
  };
  rawPoloniexOrderBook[monitoredPair] = {
    asks: [],
    bids: [],
  };
  rawHitBTCOrderBook[monitoredPair] = {
    asks: [],
    bids: [],
  };
});

// Slack hooks

export const tradesChannelURL = 'https://hooks.slack.com/services/T0A7WR57Y/B9H9XUCG1/ro4Nj' +
  'VGxcKmefNus6WvETlWb';
export const privateTradesChannelURL = 'https://hooks.slack.com/services/T0A7WR57Y/B9GAL3743/' +
  'TNnCB5fFxV1N6flLJVXc4Dgr';

// Exchanges

// TODO: lot sizes to review.
const exchanges = [
  {
    name: 'Poloniex',
    fees: 0.0025,
    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETHBTC: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETCBTC: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
      OMGBTC: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETCETH: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
      OMGETH: {
        orderValue: 0.0001,
        quantity: 0.00000001,
        decimals: 8,
      },
    },
    balances: getPoloniexBalances,
    buy: buyOnPoloniex,
    sell: sellOnPoloniex,
    cancelOrder: cancelOrderOnPoloniex,
    openOrders: getPoloniexOpenOrders,
  },

  // TODO: find minimum order quantity by pair.
  {
    name: 'Bitfinex',
    fees: 0.002,
    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.0001,
        quantity: 0.02,
        decimals: 8,
      },
      ETHBTC: {
        orderValue: 0.0005,
        quantity: 0.02,
        decimals: 8,
      },
      OMGBTC: {
        orderValue: 0.0001,
        quantity: 1,
        decimals: 8,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.0005,
        quantity: 0.02,
        decimals: 8,
      },
      OMGETH: {
        orderValue: 0.0005,
        quantity: 1,
        decimals: 8,
      },
    },
    balances: getBitfinexBalances,
    buy: buyOnBitfinex,
    sell: sellOnBitfinex,
    cancelOrder: cancelOrderOnBitfinex,
    openOrders: getBitfinexOpenOrders,
  },
  {
    name: 'Binance',

    // Binance uses 0.05% fees on BNB based symbol only.
    fees: 0.001,

    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },
      ETHBTC: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },
      ETCBTC: {
        orderValue: 0.001,
        quantity: 0.01,
        decimals: 2,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.01,
        quantity: 0.001,
        decimals: 3,
      },
      ETCETH: {
        orderValue: 0.01,
        quantity: 0.01,
        decimals: 2,
      },
    },
    balances: getBinanceBalances,
    buy: buyOnBinance,
    sell: sellOnBinance,
    cancelOrder: cancelOrderOnBinance,
    openOrders: getBinanceOpenOrders,
  },
  {
    name: 'HitBTC',
    fees: 0.0025,
    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETHBTC: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },
    },
    balances: null,
    buy: () => {},
    sell: () => {},
    cancelOrder: () => {},
    openOrders: () => {},
  },
  {
    name: 'OKEx',
    fees: 0.002,
    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETHBTC: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },
    },
    balances: getOKExBalances,
    buy: buyOnOKEx,
    sell: sellOnOKEx,
    cancelOrder: cancelOrderOnOKEx,
    openOrders: getOKExOpenOrders,
  },
  {
    name: 'Huobi',
    fees: 0.0025,
    feeDecimals: 8,
    lotSize: {

      // BTC market

      BCHBTC: {
        orderValue: 0.001,
        quantity: 0.00000001,
        decimals: 8,
      },
      ETHBTC: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },

      // ETH market

      BCHETH: {
        orderValue: 0.001,
        quantity: 0.001,
        decimals: 3,
      },
    },
    balances: null,
    buy: () => {},
    sell: () => {},
    cancelOrder: () => {},
    openOrders: () => {},
  },
];

export const supportedExchanges = process.env.SUPPORTED_EXCHANGES ?
  process.env.SUPPORTED_EXCHANGES.split(', ') : [];
export const filteredExchanges = _.filter(exchanges, filterExchange(supportedExchanges));
