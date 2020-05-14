import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import loMap from 'lodash/map';
import { Settings } from '../imports/api/settings/constants';
import { Messages } from '../imports/api/messages/constants';

const Parser = require('rss-parser');
const { createLogger, transports, format } = require('winston');

const { combine, timestamp, label, printf } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: 'server/fetchJob' }), timestamp(), loggerFormat),
  transports: [new transports.Console()],
});

const parser = new Parser();

const parseMessages = (setting) => {
  if (setting.folders) {
    setting.folders.forEach((folder) => {
      if (folder.subscriptions) {
        folder.subscriptions.forEach((subs) => {
          parser.parseURL(subs.url).then(
            (res) => {
              if (res.items.length > 0) {
                res.items.forEach((item) => {
                  // if message is older than one week: don't save
                  if (
                    moment(item.pubDate)
                      .clone()
                      .isBefore(moment().subtract(7, 'days'))
                  ) {
                    return;
                  }
                  // if title and date are already existent: don't save message again
                  const foundMessage = Messages.findOne({ title: item.title, date: item.date });
                  if (foundMessage) {
                    return;
                  }
                  // if guid is already present: don't save message again
                  const messageGuid = Messages.findOne({ guid: item.guid });
                  if (messageGuid) {
                    return;
                  }
                  const mess = { folder: folder.folderName, userId: setting.userId, isRead: false, isMarkedRead: false };
                  mess.creator = item.creator || item.author || res.title;
                  mess.date = item.date;
                  mess.title = item.title;
                  mess.link = item.link;
                  mess.pubDate = moment(item.pubDate).toDate();
                  mess.content = item.content;
                  mess.contentSnippet = item.contentSnippet;
                  mess.guid = item.guid;
                  Messages.insert(mess);
                });
              }
            },
            (err) => {
              logger.log({ level: 'warn', message: `error fetching ${subs.url} : ${err.message}` });
            }
          );
        });
      }
    });
  }
};

const cleanMessages = (setting, user) => {
  logger.log({ level: 'info', message: `running clean messages job for user ${user.username} with id ${user._id}` });
  const removed = Messages.remove({
    userId: setting.userId,
    pubDate: {
      $lte: moment()
        .subtract(7, 'days')
        .toDate(),
    },
  });
  logger.log({
    level: 'info',
    message: `clean messages job for user ${user.username} with id ${user._id} done, removed ${removed} messages`,
  });
};

const markMessages = (user) => {
  logger.log({ level: 'info', message: `running mark messages job for user ${user.username} with id ${user._id}` });
  const markedMessagesIds = loMap(Messages.find({ userId: user._id, isMarkedRead: true, isRead: false }).fetch(), '_id');
  Messages.update({ _id: { $in: markedMessagesIds } }, { $set: { isRead: true } }, { multi: true });
};

export default class FetchJob {
  static fetchRSS() {
    const dueSettings = Settings.find({ nextEvent: { $lte: new Date() } }).fetch();
    logger.log({ level: 'info', message: 'running fetch job..' });
    dueSettings.forEach((setting) => {
      const user = Meteor.users.findOne({ _id: setting.userId });
      logger.log({ level: 'info', message: `running fetch job for user ${user.username} with id ${user._id}` });

      parseMessages(setting);
      markMessages(user);
      cleanMessages(setting, user);

      const event = moment(new Date()).add(setting.interval, 'minutes');
      logger.log({
        level: 'info',
        message: `setting new next event on setting ${setting._id} to ${event} for user ${user.username} with id ${user._id}`,
      });
      Settings.update({ _id: setting._id }, { $set: { nextEvent: event.toDate() } });
    });
  }
}
