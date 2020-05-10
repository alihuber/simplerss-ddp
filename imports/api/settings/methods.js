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
  // resetSettings(userId) {
  //   check(userId, String);
  //   if (Meteor.userId() === userId) {
  //     Settings.update({ userId }, { interval: '10', folders: [], userId: Meteor.userId() });
  //   } else {
  //     throw new Meteor.Error('reset settings error');
  //   }
  // },
  updateSettings(data, userId) {
    const subscriptionPattern = { url: String };
    const folderPattern = { folderName: String, subscriptions: Match.Maybe([subscriptionPattern]) };
    const pattern = {
      interval: String,
      folders: Match.Maybe([folderPattern]),
      _id: Match.Maybe(String),
    };
    check(data, pattern);
    check(userId, String);
    // _.extend(data, { nextEvent: new Date() });
    if (userId === this.userId) {
      data.nextEvent = new Date();
      data.userId = userId;
      Settings.upsert({ userId: userId }, data);
      // run fetchjob anew because maybe we altered the next event setting
      // FetchJob.fetchRSS();
    } else {
      throw new Meteor.Error('update settings error');
    }
  },
});
