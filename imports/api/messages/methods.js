import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Match, check } from 'meteor/check';
import moment from 'moment';

import { Messages } from './constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'api/messages/methods' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

Meteor.methods({
  markAsRead(messageId) {
    check(messageId, String);
    logger.log({ level: 'info', message: `got markAsRead request from _id ${this.userId}` });
    const foundMessage = Messages.findOne({ _id: messageId, userId: this.userId });
    if (!foundMessage) {
      logger.log({ level: 'warn', message: `message with ${messageId} not found` });
      throw new Error('not authorized');
    }
    Messages.update({ _id: messageId, userId: this.userId }, { $set: { isMarkedRead: true } });
    logger.log({ level: 'info', message: `marked message with _id ${messageId} as read` });
  },
});
