import { winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { Client } from '@elastic/elasticsearch';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceElasticSearch',
  'debug',
);

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`,
  auth: {
    bearer: `${config.ELASTIC_APM_SECRET_TOKEN}`,
  },
});

export const checkConnection = async (): Promise<void> => {
  try {
    let isConnected = false;
    while (!isConnected) {
      const healthCheck = await elasticSearchClient.cluster.health({});
      log.info(
        `NotificationService Elasticsearch health check status: ${healthCheck.status}`,
      );
      isConnected = true;
    }
  } catch (error) {
    log.error('Connection to Elasticsearch failed! Retrying...');
    log.log(
      'error',
      'NotificationService checkConnection() method error:',
      error,
    );
  }
};
