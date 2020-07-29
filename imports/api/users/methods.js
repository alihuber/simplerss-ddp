import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

import { Settings } from '../settings/constants';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'api/users/methods' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

Meteor.methods({
  removeUser: function (userId) {
    check(userId, String);
    const isAdmin = Meteor.users.findOne(this.userId).admin;
    if (isAdmin) {
      if (Meteor.isServer) {
        logger.info(`deleted user with id ${userId}`);
      }
      Meteor.users.remove({ _id: userId });
    } else {
      throw new Meteor.Error('delete user error');
    }
  },
  updateUser: function (data) {
    const pattern = {
      _id: String,
      username: String,
      password: Match.Maybe(String),
      admin: Match.Maybe(Boolean),
    };
    check(data, pattern);
    const thisUser = Meteor.users.findOne(this.userId);
    const isAdmin = thisUser?.admin;
    if (isAdmin) {
      if (data.password) {
        Accounts.setPassword(data._id, data.password);
      }
      Accounts.setUsername(data._id, data.username);
      const adminSet = data.admin || false;
      Meteor.users.update({ _id: data._id }, { $set: { admin: adminSet } });
      if (Meteor.isServer) {
        logger.info(`updated user with id ${data._id}, set ADMIN to ${adminSet}`);
      }
    } else {
      throw new Meteor.Error('update user error');
    }
  },
  addUser: function (data) {
    const pattern = {
      username: String,
      password: String,
      admin: Match.Maybe(Boolean),
    };
    check(data, pattern);
    const thisUser = Meteor.users.findOne(this.userId);
    const isAdmin = thisUser?.admin;
    if (isAdmin) {
      const newId = Accounts.createUser(data);
      const admin = data.admin || false;
      Meteor.users.update({ _id: newId }, { $set: { admin } });
      if (Meteor.isServer) {
        logger.info(`created user with id ${newId}, set ADMIN to ${admin}`);
      }
      if (admin) {
        const settingsObj = {
          userId: newId,
          interval: 10,
          folders: [],
        };
        const settingsId = Settings.insert(settingsObj);
        if (Meteor.isServer) {
          logger.info(`created settings with id ${settingsId} for user ${newId}`);
        }
      }
    } else {
      throw new Meteor.Error('add user error');
    }
  },
});
