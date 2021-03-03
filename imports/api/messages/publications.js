import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';
import { Messages } from './constants';
import { Settings } from '../settings/constants';

Meteor.publish('userMessages', function (sort) {
  check(sort, Number);
  const userSettings = Settings.findOne({ userId: this.userId });
  const blocklist = userSettings?.blocklist || [];
  const foundMessages = Messages.find(
    {
      userId: this.userId,
      isRead: false,
      pubDate: {
        $gte: moment().subtract(3, 'days').toDate(),
      },
    },
    { sort: { pubDate: sort } }
  ).fetch();
  const foundIds = foundMessages
    .filter((m) => {
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
    })
    .map((m) => m._id);

  return Messages.find({ _id: { $in: foundIds } });
});
