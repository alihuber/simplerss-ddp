import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import { Messages } from './constants';

Meteor.publish('userMessages', function () {
  return Messages.find({
    userId: this.userId,
    isRead: false,
    pubDate: {
      $gte: moment().subtract(3, 'days').toDate(),
    },
  });
});
