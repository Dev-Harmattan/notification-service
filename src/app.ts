import express, { Express } from 'express';
import { config } from '@notifications/config';
import { winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { start } from '@notifications/server';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceApp',
  'debug',
);

const initialize = () => {
  const app: Express = express();
  start(app);
  log.info('NotificationService app initialized');
};

initialize();
