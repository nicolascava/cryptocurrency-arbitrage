import winston from 'winston';
import chalk from 'chalk';
import moment from 'moment';

import toFixed from './toFixed';

// TODO: permutations X chains is not good math.

const numberOfChains = 4;

function logChainA1(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(chalk.white(`${bestChain.exchange1.name} ` +
    `(+${toFixed(bestChain.order1QuantityAfterFees, 8)} ${marketCurrency2} / ` +
    `-${toFixed(bestChain.cost, 8)} ${marketCurrency1})`));
  winston.info(chalk.white(`${bestChain.exchange2.name} (+${bestChain.order3Quantity} ` +
    `${symbolCurrency} / -${toFixed(bestChain.order1QuantityAfterFees, 8)} ${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange3.name} (-${bestChain.order3Quantity} ` +
    `${symbolCurrency} / +${toFixed(bestChain.gain, 8)} ${marketCurrency1})`));
}

function logChainA2(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(chalk.white(`${bestChain.exchange1.name} (+${bestChain.order2Quantity} ` +
    `${symbolCurrency} / -${toFixed(bestChain.cost, 8)} ${marketCurrency1})`));
  winston.info(chalk.white(`${bestChain.exchange2.name} (-${bestChain.order2Quantity} ` +
    `${symbolCurrency} / +${toFixed(bestChain.gainAfterOrder2, 8)} ${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange3.name} (-${bestChain.order3Quantity} ` +
    `${marketCurrency2} / +${toFixed(bestChain.gain, 8)} ${marketCurrency1})`));
}

function logChainA3(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(chalk.white(`${bestChain.exchange1.name} (-${bestChain.order1Quantity} ` +
    `${marketCurrency2} / +${toFixed(bestChain.gain, 8)} ${marketCurrency1})`));
  winston.info(chalk.white(`${bestChain.exchange2.name} (-${bestChain.order2Quantity} ` +
    `${symbolCurrency} / +${toFixed(bestChain.order1Quantity, 8)} ${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange3.name} (+${bestChain.order3Quantity} ` +
    `${symbolCurrency} / -${toFixed(bestChain.cost, 8)} ${marketCurrency1})`));
}

function logChainA4(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(chalk.white(`${bestChain.exchange1.name} (-${bestChain.order1Quantity} ` +
    `${symbolCurrency} / +${toFixed(bestChain.gain, 8)} ${marketCurrency1})`));
  winston.info(chalk.white(`${bestChain.exchange2.name} (+${bestChain.order2Quantity} ` +
    `${symbolCurrency} / -${toFixed(bestChain.order2QuantityCost, 8)} ${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange3.name} (+${bestChain.order3Quantity} ` +
    `${marketCurrency2} / -${toFixed(bestChain.cost, 8)} ${marketCurrency1})`));
}

function logChainB1(
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency,
) {
  winston.info(chalk.white(`${bestChain.exchange1.name} (+${bestChain.order1Quantity} ` +
    `${symbolCurrency} / -${toFixed(bestChain.cost, 8)} ${marketCurrency1})`));
  winston.info(chalk.white(`${bestChain.exchange2.name} (-${bestChain.order2Quantity} ` +
    `${symbolCurrency} / +${toFixed(bestChain.gainAfterOrder2, 8)} ${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange3.name} (+${bestChain.order3Quantity} ` +
    `${secondSymbolCurrency} / -${toFixed(bestChain.order3QuantityAfterFees, 8)} ` +
    `${marketCurrency2})`));
  winston.info(chalk.white(`${bestChain.exchange4.name} (-${bestChain.order4Quantity} ` +
    `${secondSymbolCurrency} / +${toFixed(bestChain.gain, 8)} ${marketCurrency1})`));
}

function logVerbose(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(`Cost: ${chalk.white(`${toFixed(bestChain.cost, 8)} ${marketCurrency1}`)}`);
  winston.info(`Gain: ${chalk.white(`${toFixed(bestChain.gain, 8)} ${marketCurrency1}`)}`);
  winston.info('');
  winston.info(`Chain: ${chalk.white(`${bestChain.exchange1.name} => ` +
    `${bestChain.exchange2.name} => ${bestChain.exchange3.name}`)}`);
  winston.info(`Currencies: ${chalk.white(`${symbolCurrency} ${marketCurrency1} ` +
    `${marketCurrency2}`)}`);
  winston.info('');
}

function logChainA1Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(`Order 1: ${chalk.white(`+${bestChain.order1Quantity} ` +
    `${marketCurrency2} / ${bestChain.order1.price} ${marketCurrency1} ` +
    `(${bestChain.order1.quantity}/${bestChain.order1.price})`)}`);
  winston.info(`Order 2: ${chalk.white(`+${bestChain.order2Quantity} ` +
    `${symbolCurrency} / ${bestChain.order2.price} ${marketCurrency2} ` +
    `(${bestChain.order2.quantity}/${bestChain.order2.price})`)}`);
  winston.info(`Order 3: ${chalk.white(`-${bestChain.order3Quantity} ` +
    `${symbolCurrency} / ${bestChain.order3.price} ${marketCurrency1} ` +
    `(${bestChain.order3.quantity}/${bestChain.order3.price})`)}`);
}

function logChainA2Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(`Order 1: ${chalk.white(`+${bestChain.order1Quantity} ` +
    `${symbolCurrency} / ${bestChain.order1.price} ${marketCurrency1} ` +
    `(${bestChain.order1.quantity}/${bestChain.order1.price})`)}`);
  winston.info(`Order 2: ${chalk.white(`-${bestChain.order2Quantity} ` +
    `${symbolCurrency} / ${bestChain.order2.price} ${marketCurrency2} ` +
    `(${bestChain.order2.quantity}/${bestChain.order2.price})`)}`);
  winston.info(`Order 3: ${chalk.white(`-${bestChain.order3Quantity} ` +
    `${marketCurrency2} / ${bestChain.order3.price} ${marketCurrency1} ` +
    `(${bestChain.order3.quantity}/${bestChain.order3.price})`)}`);
}

function logChainA3Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(`Order 1: ${chalk.white(`-${bestChain.order1Quantity} ` +
    `${marketCurrency2} / ${bestChain.order1.price} ${marketCurrency1} ` +
    `(${bestChain.order1.quantity}/${bestChain.order1.price})`)}`);
  winston.info(`Order 2: ${chalk.white(`-${bestChain.order2Quantity} ` +
    `${symbolCurrency} / ${bestChain.order2.price} ${marketCurrency2} ` +
    `(${bestChain.order2.quantity}/${bestChain.order2.price})`)}`);
  winston.info(`Order 3: ${chalk.white(`+${bestChain.order3Quantity} ` +
    `${symbolCurrency} / ${bestChain.order3.price} ${marketCurrency1} ` +
    `(${bestChain.order3.quantity}/${bestChain.order3.price})`)}`);
}

function logChainA4Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2) {
  winston.info(`Order 1: ${chalk.white(`-${bestChain.order1Quantity} ${symbolCurrency} ` +
    `/ ${bestChain.order1.price} ${marketCurrency1} (${bestChain.order1.quantity}/` +
    `${bestChain.order1.price})`)}`);
  winston.info(`Order 2: ${chalk.white(`+${bestChain.order2Quantity} ${symbolCurrency}` +
    ` / ${bestChain.order2.price} ${marketCurrency2} (${bestChain.order2.quantity}/` +
    `${bestChain.order2.price})`)}`);
  winston.info(`Order 3: ${chalk.white(`+${bestChain.order3Quantity} ${marketCurrency2}` +
    ` / ${bestChain.order3.price} ${marketCurrency1} (${bestChain.order3.quantity}/` +
    `${bestChain.order3.price})`)}`);
}

function logChainB1Orders(
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency,
) {
  winston.info(`Order 1: ${chalk.white(`+${bestChain.order1Quantity} ${symbolCurrency}` +
    ` / ${bestChain.order1.price} ${marketCurrency1} (${bestChain.order1.quantity}` +
    `/${bestChain.order1.price})`)}`);
  winston.info(`Order 2: ${chalk.white(`-${bestChain.order2Quantity} ${symbolCurrency}` +
    ` / ${bestChain.order2.price} ${marketCurrency2} (${bestChain.order2.quantity}/` +
    `${bestChain.order2.price})`)}`);
  winston.info(`Order 3: ${chalk.white(`+${bestChain.order3Quantity} ${secondSymbolCurrency}` +
    ` / ${bestChain.order3.price} ${marketCurrency2} (${bestChain.order3.quantity}/` +
    `${bestChain.order3.price})`)}`);
  winston.info(`Order 4: ${chalk.white(`-${bestChain.order4Quantity} ${secondSymbolCurrency}` +
    ` / ${bestChain.order4.price} ${marketCurrency1} (${bestChain.order4.quantity}/` +
    `${bestChain.order4.price})`)}`);
}

export default function (
  bestChain,
  symbolCurrency,
  marketCurrency1,
  marketCurrency2,
  secondSymbolCurrency = null,
  verbose = false,
) {
  // Profit display color on the console.
  const profitColor = bestChain.profit > 0 ? 'cyan' : 'red';

  winston.info(chalk.white(moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS')));
  winston.info('');
  winston.info(`Profit: ${chalk[profitColor](`${toFixed(bestChain.profit, 8)} ` +
    `${marketCurrency1}`)}`);
  winston.info(`ROI: ${chalk[profitColor](`${toFixed(bestChain.roi, 8)}%`)}`);
  winston.info(`Available chains: ${chalk.white(`${bestChain.chainsSum}/` +
    `${(bestChain.permutationsSum) * numberOfChains}`)}`);
  winston.info(`Chain ID: ${chalk.white(`${bestChain.chainID}`)}`);
  winston.info('');

  if (bestChain.chainID === 'A1') {
    logChainA1Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A2') {
    logChainA2Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A3') {
    logChainA3Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A4') {
    logChainA4Orders(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else {
    logChainB1Orders(
      bestChain,
      symbolCurrency,
      marketCurrency1,
      marketCurrency2,
      secondSymbolCurrency,
    );
  }

  winston.info('');

  if (verbose) logVerbose(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);

  if (bestChain.chainID === 'A1') {
    logChainA1(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A2') {
    logChainA2(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A3') {
    logChainA3(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else if (bestChain.chainID === 'A4') {
    logChainA4(bestChain, symbolCurrency, marketCurrency1, marketCurrency2);
  } else {
    logChainB1(bestChain, symbolCurrency, marketCurrency1, marketCurrency2, secondSymbolCurrency);
  }

  winston.info('--------------');
}
