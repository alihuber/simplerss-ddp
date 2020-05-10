import { Meteor } from 'meteor/meteor';

import { Settings } from './constants';

Meteor.publish('userSettings', function () {
  const user = Meteor.users.findOne({ _id: this.userId });
  if (user && !user.admin) {
    return Settings.find({ userId: this.userId });
  } else {
    return [];
  }
});
