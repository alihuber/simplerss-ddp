import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Settings } from './constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'api/settings/methods' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

Meteor.methods({
  updateSettings(data, userId) {
    const subscriptionPattern = { url: String };
    const folderPattern = { folderName: String, subscriptions: Match.Maybe([subscriptionPattern]) };
    const pattern = {
      interval: String,
      folders: Match.Maybe([folderPattern]),
      blocklist: Match.Maybe([String]),
      _id: Match.Maybe(String),
    };
    check(data, pattern);
    check(userId, String);
    const parsedInterval = parseInt(data.interval, 10);
    if (userId === this.userId) {
      data.nextEvent = new Date();
      data.userId = userId;
      data.interval = parsedInterval;
      Settings.upsert({ userId: userId }, data);
      if (Meteor.isServer) {
        logger.info(`update settings for ${userId}, set nextEvent to ${data.nextEvent}`);
      }
      // run fetchjob anew because maybe we altered the next event setting
      if (!Meteor.isTest) {
        Meteor.call('runFetchJob');
      }
    } else {
      throw new Meteor.Error('update settings error');
    }
  },
});
