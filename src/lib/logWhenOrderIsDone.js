import chalk from 'chalk';
import winston from 'winston';

export default function (
  concernedExchange,
  quantity,
  mainExchangePrice,
  symbolCurrency,
  marketCurrency,
  index,
) {
  winston.info(chalk.yellow(`Order ${index} done on ${concernedExchange.name} for ` +
    `${quantity} ${symbolCurrency} at ${mainExchangePrice} ${marketCurrency} / unit`));
}
