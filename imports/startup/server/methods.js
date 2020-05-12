import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import moment from 'moment';
import { Messages } from '../../api/messages/constants';
import FetchJob from '../../../server/fetchJob';
import '../../api/users/methods.js';
import '../../api/settings/methods.js';
import '../../api/messages/methods.js';

Meteor.methods({
  runFetchJob() {
    FetchJob.fetchRSS();
  },
  insertTestmessages() {
    if (Meteor.isServer) {
      if (!Meteor.users.findOne(this.userId).admin) {
        throw new Meteor.Error('unauthorized');
      }
      const testuser = Meteor.users.findOne({ username: 'asdf' });
      if (testuser) {
        for (let index = 0; index < 10; index += 1) {
          const date = moment().subtract(index, 'minutes');
          const testMessageObj = {
            'folder': 'News',
            'userId': testuser._id,
            'creator': 'News feed',
            'title': 'Zombie apokalypse imminent',
            'link': 'https://example.com/news',
            'content': 'Zombie ipsum brains reversus ab cerebellum viral inferno, brein nam rick mend grimes malum cerveau cerebro. De carne cerebro lumbering animata cervello corpora quaeritis. Summus thalamus brains sit​​, morbo basal ganglia vel maleficia? De braaaiiiins apocalypsi gorger omero prefrontal cortex undead survivor fornix dictum mauris. Hi brains mindless mortuis limbic cortex soulless creaturas optic nerve, imo evil braaiinns stalking monstra hypothalamus adventus resi hippocampus dentevil vultus brain comedat cerebella pitiutary gland viventium. Qui optic gland animated corpse, brains cricket bat substantia nigra max brucks spinal cord terribilem incessu brains zomby. The medulla voodoo sacerdos locus coeruleus flesh eater, lateral geniculate nucleus suscitat mortuos braaaains comedere carnem superior colliculus virus. Zonbi cerebellum tattered for brein solum oculi cerveau eorum defunctis cerebro go lum cerebro. Nescio brains an Undead cervello zombies. Sicut thalamus malus putrid brains voodoo horror. Nigh basal ganglia tofth eliv ingdead.',
            'contentSnippet': 'Zombie ipsum brains reversus ab cerebellum viral inferno, brein nam rick mend grimes malum cerveau cerebro....',
            'guid': Random.id(),
            'pubDate': date.toDate(),
            '_test': true,
          };
          Messages.insert(testMessageObj);
        }
      }
    }
  },
  removeTestmessages() {
    if (Meteor.isServer) {
      if (!Meteor.users.findOne(this.userId).admin) {
        throw new Meteor.Error('unauthorized');
      }
      Messages.remove({ _test: true });
    }
  },
});
