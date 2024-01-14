import { ConsumeMessage, Channel } from 'amqplib';
import { IEmailLocals, winstonLogger } from '@dev-harmattan/shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { createConnection } from '@notifications/queues/connection';

import { sendEmail } from './mail.transport';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notificationServiceConsumer',
  'debug',
);

export const consumeAuthEmailMessage = async (
  channel: Channel,
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const queue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });
    await channel.bindQueue(queue.queue, exchangeName, routingKey);
    channel.consume(queue.queue, async (message: ConsumeMessage | null) => {
      console.log();
      const { receiverEmail, username, verifyLink, resetLink, template } =
        JSON.parse(message!.content.toString('utf-8'));

      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        verifyLink,
        resetLink,
      };

      await sendEmail(template, receiverEmail, locals);

      channel.ack(message as ConsumeMessage);
    });
  } catch (error) {
    log.log(
      'error',
      'NotificationService consumeAuthEmailMessage() method error:',
      error,
    );
  }
};

export const consumeOrderEmailMessage = async (
  channel: Channel,
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const queue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });
    await channel.bindQueue(queue.queue, exchangeName, routingKey);
    channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total,
      } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total,
      };
      if (template === 'orderPlaced') {
        await sendEmail('orderPlaced', receiverEmail, locals);
        await sendEmail('orderReceipt', receiverEmail, locals);
      } else {
        await sendEmail(template, receiverEmail, locals);
      }
      channel.ack(msg!);
    });
  } catch (error) {
    log.log(
      'error',
      'NotificationService consumeOrderEmailMessage() method error:',
      error,
    );
  }
};
