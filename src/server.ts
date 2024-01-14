import 'express-async-errors';
import http from 'http';

import { config } from '@notifications/config';
import { Application } from 'express';
import { IEmailMessageDetails, winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { Channel } from 'amqplib';

import {
  consumeAuthEmailMessage,
  consumeOrderEmailMessage,
} from './queues/email.consumer';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceServer',
  'debug',
);

export const start = (app: Application) => {
  startServer(app);

  app.use('', healthRoutes);

  startQueues();
  startElasticSearch();
};

const startQueues = async (): Promise<void> => {
  const emailChannel: Channel = (await createConnection()) as Channel;
  consumeAuthEmailMessage(emailChannel);
  consumeOrderEmailMessage(emailChannel);

  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=363w6w6w6464646`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: `${config.SENDER_EMAIL}`,
    verifyLink: verificationLink,
    template: 'verifyEmail',
  };

  await emailChannel.assertExchange('jobber-email-notification', 'direct');
  emailChannel.publish(
    'jobber-email-notification',
    'auth-email',
    Buffer.from(JSON.stringify(messageDetails)),
  );

  // await emailChannel.assertExchange('jobber-order-notification', 'direct');
  // emailChannel.publish(
  //   'jobber-order-notification',
  //   'order-email',
  //   Buffer.from(JSON.stringify({ name: 'order', email: 'test@test2.com' })),
  // );
};

const startElasticSearch = (): void => {
  checkConnection();
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = http.createServer(app);
    log.info(
      `Worker with process id of ${process.pid} on Notification service has started`,
    );
    httpServer.listen(SERVER_PORT, () => {
      log.info(`NotificationService server listening on ${SERVER_PORT}`);
    });
    closeConnection(httpServer);
  } catch (error) {
    log.log('error', 'NotificationService startServer() method error', error);
  }
};

const closeConnection = (server: http.Server) => {
  process.on('SIGINT', () => {
    // Close the server
    server.close(() => {
      process.exit(0);
    });
  });
};
