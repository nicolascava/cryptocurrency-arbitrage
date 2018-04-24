import chalk from 'chalk';
import winston from 'winston';

export default function (error) {
  winston.info(chalk.red('An error occurred with Poloniex:'), error);
}
