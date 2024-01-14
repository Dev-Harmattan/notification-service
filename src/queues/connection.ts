import client, { Channel, Connection } from 'amqplib';
import { winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceQueue',
  'debug',
);

export const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: Connection = await client.connect(
      `${config.RABBITMQ_ENDPOINT}`,
    );
    const channel: Channel = await connection.createChannel();
    log.info('NotificationService queue connected successfully....');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log(
      'error',
      'NotificationService createConnection() method error:',
      error,
    );
    return undefined;
  }
};

const closeConnection = (channel: Channel, connection: Connection): void => {
  process.on('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
};
