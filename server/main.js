import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { onPageLoad } from 'meteor/server-render';
import loMap from 'lodash/map';
import './publications.js';
import '../imports/startup/server/methods';
import { Settings } from '../imports/api/settings/constants';
// import FetchJob from './fetchJob';
// import agenda from './agenda';
import './agenda';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'server/main' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

Meteor.startup(() => {
  const user = Meteor.users.findOne({ username: 'admin' });
  if (!user) {
    logger.info('admin user not found, seeding admin user...');
    Meteor.users.insert({ username: 'admin', admin: true });
    const newUser = Meteor.users.findOne({ username: 'admin' });
    const pw = process.env.ADMIN || 'adminadmin';
    Accounts.setPassword(newUser._id, pw);
  }

  // find users without settings
  const allUserIds = loMap(Meteor.users.find({}, { fields: { _id: 1 } }).fetch(), '_id');
  const missingIds = allUserIds.filter((u) => !Settings.findOne({ userId: u }));
  missingIds.forEach((userId) => {
    const settingsObj = {
      userId,
      interval: 10,
      folders: [],
    };
    Settings.insert(settingsObj);
  });


  logger.info(`server started... registered users: ${Meteor.users.find({}).fetch().length}`);
});

onPageLoad((sink) => {
  // Code to run on every request.
  // sink.renderIntoElementById(
  //   "server-render-target",
  //   `Server time: ${new Date}`
  // );
});

// agenda.define('fetchRss', async (job) => {
//   await FetchJob.fetchRSS();
// });

// (async function () { // IIFE to give access to async/await
//   await agenda.start();
//   await agenda.every('1 minute', 'fetchRss');
// }());
