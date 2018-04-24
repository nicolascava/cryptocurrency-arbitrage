import winston from 'winston';
import chalk from 'chalk';

export default function (input) {
  const {
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
  } = input;

  winston.info('Current overall balances:');
  winston.info(`- ${chalk.cyan(`${newMarket1CurrencyAmount} ${marketCurrency1}`)}`);
  winston.info(`- ${chalk.cyan(`${newMarket2CurrencyAmount} ${marketCurrency2}`)}`);
  winston.info(`- ${chalk.cyan(`${newSymbolCurrencyAmount} ${symbolCurrency}`)}`);
  winston.info('Balance differences since the last trade:');
  winston.info(`- ${chalk.cyan(`${market1Sign + marketCurrency1Difference} ${marketCurrency1}`)}`);
  winston.info(`- ${chalk.cyan(`${market2Sign + marketCurrency2Difference} ${marketCurrency2}`)}`);
  winston.info(`- ${chalk.cyan(`${symbolSign + symbolCurrencyDifference} ${symbolCurrency}`)}`);
}
