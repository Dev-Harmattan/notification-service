import { IEmailLocals, winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { emailTemplates } from '@notifications/helper';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceMailTransport',
  'debug',
);

export const sendEmail = async (
  template: string,
  receiverEmail: string,
  locals: IEmailLocals,
): Promise<void> => {
  try {
    emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully');
  } catch (error) {
    log.log('error', 'NotificationService sendEmail() method error:', error);
  }
};
