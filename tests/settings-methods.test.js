import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import assert from 'assert';

import '../imports/api/settings/methods';
import { Settings } from '../imports/api/settings/constants';

if (Meteor.isServer) {
  describe('updateSettings method', () => {
    it('updates settings for user if currentUser', () => {
      resetDatabase();
      const userId = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      const settingsObj = {
        userId,
        interval: 10,
        folders: [],
      };
      const presentSettingsId = Settings.insert(settingsObj);
      const updateObj = {
        interval: '60',
        folders: [{ folderName: 'testfolder', subscriptions: [{ url: 'http://example.com' }] }],
      };

      const method = Meteor.server.method_handlers.updateSettings;
      method.apply({ userId: userId }, [updateObj, userId]);
      const updatedSettings = Settings.findOne(presentSettingsId);
      assert.equal(updatedSettings.interval, 60);
      assert.deepEqual(updatedSettings.folders[0], { folderName: 'testfolder', subscriptions: [{ url: 'http://example.com' }] });
    });

    it('throws update error if not currentUser', () => {
      resetDatabase();
      const userId2 = Accounts.createUser({
        username: 'testuser',
        password: 'example123',
      });
      const userId = Accounts.createUser({
        username: 'testuser2',
        password: 'example123',
      });
      const settingsObj = {
        userId,
        interval: 10,
        folders: [],
      };
      Settings.insert(settingsObj);
      const updateObj = {
        interval: '60',
        folders: [{ folderName: 'testfolder', subscriptions: [{ url: 'http://example.com' }] }],
      };

      const method = Meteor.server.method_handlers.updateSettings;
      try {
        method.apply({ userId: userId }, [updateObj, userId2]);
      } catch (e) {
        assert(e.message, '[update settings error]');
      }
    });
  });
}
