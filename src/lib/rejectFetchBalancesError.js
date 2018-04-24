import winston from 'winston';
import chalk from 'chalk';

export default function (reject) {
  return (error) => {
    winston.info(chalk.red('Unexpected error when processing balances'), error);

    return reject();
  };
}
