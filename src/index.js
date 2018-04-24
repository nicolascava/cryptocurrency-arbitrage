import winston from 'winston';
import chalk from 'chalk';
import express from 'express';

import { filteredExchanges, port } from './config/Base';
import fetchBalances from './lib/fetchBalances';
import getStats from './lib/getStats';
import handleFetchBalancesError from './lib/handleFetchBalancesError';
import initDatabase from './lib/initDatabase';
import setupExchangeConfig from './lib/setupExchangeConfig';
import handleStreams from './lib/handleStreams';

try {
  const app = express();

  initDatabase();
  filteredExchanges.forEach(setupExchangeConfig);
  fetchBalances().catch(handleFetchBalancesError);
  handleStreams();

  app.get('/', getStats);

  app.listen(port);
} catch (error) {
  winston.info(chalk.red('An unexpected error occurred:'), error);
}
