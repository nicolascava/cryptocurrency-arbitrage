import winston from 'winston';
import chalk from 'chalk';

export default function (error) {
  winston.info(chalk.red('Unexpected error:', error));
}
