import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import moment from 'moment';
import { Messages } from '../../api/messages/constants';
import FetchJob from '../../../server/fetchJob';
import '../../api/users/methods.js';
import '../../api/settings/methods.js';
import '../../api/messages/methods.js';
// {
//     "_id": "2BBo4ScdNCS3Phqpf",
//     "folder": "IT-News",
//     "userId": "XxY75thtDLfs8rHtS",
//     "isRead": true,
//     "isMarkedRead": true,
//     "creator": "t3n RSS Feed - News",
//     "title": "Experten: Gefahr von Hackerangriffen in Coronakrise gestiegen",
//     "link": "http://feedproxy.google.com/~r/aktuell/feeds/rss/~3/_UyLQi2wXBs/",
//     "pubDate": {
//         "$date": "2020-05-11T07:45:37.000Z"
//     },
//     "content": "<img src=\"https://assets.t3n.sc/news/wp-content/uploads/2017/02/Spam-E-Mails-shutterstock-172545959.jpg?auto=compress%2Cformat&amp;fit=crop&amp;h=300&amp;ixlib=php-3.1.0&amp;max-h=600&amp;q=65&amp;w=600&amp;s=8a40d3565f0ca8a80e4691e132dec0e6\" /><p>Das hohe Informationsbedürfnis der Menschen in Zeiten der Corona-Pandemie nutzen Cyberkriminelle aktuell gezielt aus. So sind beispielsweise gefälschte E-Mails im Umlauf.\r\n</p><p>\r\nDie Gefahr von Hackerangriffen auf Computer ist nach Einschätzung von Experten in der Coronakrise gestiegen. Gründe dafür seien das vielfach geänderte Arbeitsverhalten im Homeoffice – statt im Büro – und das gesteigerte Informationsbedürfnis der Bevölkerung, teilte das Landeskriminalamt (LKA) Rheinland-Pfalz in Mainz mit. Mehrere Sicherheitsbehörden, darunter das LKA, hätten vor diesem ...</p><a href=\"https://t3n.de/news/experten-gefahr-hackerangriffen-1278627/?utm_source=rss&amp;utm_medium=feed&amp;utm_campaign=news\">weiterlesen auf t3n.de</a><img src=\"http://feeds.feedburner.com/~r/aktuell/feeds/rss/~4/_UyLQi2wXBs\" height=\"1\" width=\"1\" alt=\"\"/>",
//     "contentSnippet": "Das hohe Informationsbedürfnis der Menschen in Zeiten der Corona-Pandemie nutzen Cyberkriminelle aktuell gezielt aus. So sind beispielsweise gefälschte E-Mails im Umlauf.\r\n\r\nDie Gefahr von Hackerangriffen auf Computer ist nach Einschätzung von Experten in der Coronakrise gestiegen. Gründe dafür seien das vielfach geänderte Arbeitsverhalten im Homeoffice – statt im Büro – und das gesteigerte Informationsbedürfnis der Bevölkerung, teilte das Landeskriminalamt (LKA) Rheinland-Pfalz in Mainz mit. Mehrere Sicherheitsbehörden, darunter das LKA, hätten vor diesem ...weiterlesen auf t3n.de",
//     "guid": "news-article-1278627"
// }

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
            // 'title': 'Zombie apokalypse imminent',
            'title': 'Experten: Gefahr von Hackerangriffen in Coronakrise gestiegen',
            'link': 'http://feedproxy.google.com/~r/aktuell/feeds/rss/~3/_UyLQi2wXBs/',
            'content': '<img src="https://assets.t3n.sc/news/wp-content/uploads/2017/02/Spam-E-Mails-shutterstock-172545959.jpg?auto=compress%2Cformat&amp;fit=crop&amp;h=300&amp;ixlib=php-3.1.0&amp;max-h=600&amp;q=65&amp;w=600&amp;s=8a40d3565f0ca8a80e4691e132dec0e6" /><p>Das hohe Informationsbedürfnis der Menschen in Zeiten der Corona-Pandemie nutzen Cyberkriminelle aktuell gezielt aus. So sind beispielsweise gefälschte E-Mails im Umlauf.\r\n</p><p>\r\nDie Gefahr von Hackerangriffen auf Computer ist nach Einschätzung von Experten in der Coronakrise gestiegen. Gründe dafür seien das vielfach geänderte Arbeitsverhalten im Homeoffice – statt im Büro – und das gesteigerte Informationsbedürfnis der Bevölkerung, teilte das Landeskriminalamt (LKA) Rheinland-Pfalz in Mainz mit. Mehrere Sicherheitsbehörden, darunter das LKA, hätten vor diesem ...</p><a href="https://t3n.de/news/experten-gefahr-hackerangriffen-1278627/?utm_source=rss&amp;utm_medium=feed&amp;utm_campaign=news">weiterlesen auf t3n.de</a><img src="http://feeds.feedburner.com/~r/aktuell/feeds/rss/~4/_UyLQi2wXBs" height="1" width="1" alt=""/>',
            'contentSnippet': 'Das hohe Informationsbedürfnis der Menschen in Zeiten der Corona-Pandemie nutzen Cyberkriminelle aktuell gezielt aus. So sind beispielsweise gefälschte E-Mails im Umlauf.\r\n\r\nDie Gefahr von Hackerangriffen auf Computer ist nach Einschätzung von Experten in der Coronakrise gestiegen. Gründe dafür seien das vielfach geänderte Arbeitsverhalten im Homeoffice – statt im Büro – und das gesteigerte Informationsbedürfnis der Bevölkerung, teilte das Landeskriminalamt (LKA) Rheinland-Pfalz in Mainz mit. Mehrere Sicherheitsbehörden, darunter das LKA, hätten vor diesem ...weiterlesen auf t3n.de',
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
