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

});
