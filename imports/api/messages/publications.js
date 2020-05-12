import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Messages } from './constants';

Meteor.publish('messageCount', function () {
  Counts.publish(this, 'messageCountForUser', Messages.find({ userId: this.userId }));
});
