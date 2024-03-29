import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import loMap from 'lodash/map';
import moment from 'moment';

import { Messages } from './constants';
import { Settings } from '../settings/constants';

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
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `got markAsRead request from _id ${this.userId}` });
    }
    const foundMessage = Messages.findOne({ _id: messageId, userId: this.userId });
    if (!foundMessage) {
      if (Meteor.isServer) {
        logger.log({ level: 'warn', message: `message with ${messageId} not found` });
      }
      throw new Error('not authorized');
    }
    Messages.update({ _id: messageId, userId: this.userId }, { $set: { isMarkedRead: true } });
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `marked message with _id ${messageId} as read` });
    }
  },
  setRead() {
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `got setRead request from _id ${this.userId}` });
    }
    const markedMessagesIds = loMap(Messages.find({ userId: this.userId, isMarkedRead: true, isRead: false }).fetch(), '_id');
    Messages.update({ _id: { $in: markedMessagesIds } }, { $set: { isRead: true } }, { multi: true });
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `set messages with ids ${markedMessagesIds} to read` });
    }
  },
  countMessagesForUser() {
    if (!this.userId) {
      return 0;
    }
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `got countMessagesForUser request from _id ${this.userId}` });
    }
    const userSettings = Settings.findOne({ userId: this.userId });
    const blocklist = userSettings?.blocklist || [];
    const foundMessages = Messages.find({
      userId: this.userId,
      isMarkedRead: false,
      pubDate: {
        $gte: moment().subtract(3, 'days').toDate(),
      },
    }).fetch();
    return foundMessages.filter((m) => {
      if (
        blocklist.some((b) => {
          const lowerBlock = b.toLowerCase();
          return (
            (m.title && m.title.toLowerCase().includes(lowerBlock)) ||
            (m.content && m.content.toLowerCase().includes(lowerBlock)) ||
            (m.contentSnippet && m.contentSnippet.toLowerCase().includes(lowerBlock))
          );
        })
      ) {
        return false;
      }
      return true;
    }).length;
  },
  getUserSettings() {
    if (Meteor.isServer) {
      logger.log({ level: 'info', message: `got getUserSettings request from _id ${this.userId}` });
    }
    if (!this.userId) {
      return {};
    }
    const userSettings = Settings.findOne({ userId: this.userId });
    return userSettings;
  },
});
