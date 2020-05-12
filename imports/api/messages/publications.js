import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import moment from 'moment';
import { Messages } from './constants';

Meteor.publish('messageCount', function () {
  Counts.publish(this, 'messageCountForUser', Messages.find(
    {
      userId: this.userId,
      isMarkedRead: false,
      pubDate: {
        $gte: moment()
          .subtract(3, 'days')
          .toDate(),
      },
    }
  ));
});

Meteor.publish('userMessages', function () {
  return Messages.find(
    {
      userId: this.userId,
      isRead: false,
      pubDate: {
        $gte: moment()
          .subtract(3, 'days')
          .toDate(),
      },
    },
    { sort: { pubDate: -1 } }
  );
});
