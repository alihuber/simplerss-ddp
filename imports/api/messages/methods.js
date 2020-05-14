import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import loMap from 'lodash/map';

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
  setRead() {
    logger.log({ level: 'info', message: `got setRead request from _id ${this.userId}` });
    const markedMessagesIds = loMap(Messages.find({ userId: this.userId, isMarkedRead: true, isRead: false }).fetch(), '_id');
    Messages.update({ _id: { $in: markedMessagesIds } }, { $set: { isRead: true } }, { multi: true });
    logger.log({ level: 'info', message: `set messages with ids ${markedMessagesIds} to read` });
  },
});
