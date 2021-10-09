import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useContext, useEffect, useState } from 'react';
import { List, Button } from 'antd';
import moment from 'moment';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimationContext from '../../contexts/AnimationContext';
import SortContext from '../../contexts/SortContext';
import Loading from '../Loading';
import { Messages as MessagesModel } from '../../../api/messages/constants';

const Messages = () => {
  const animClass = useContext(AnimationContext);
  const currentUser = useContext(CurrentUserContext);
  const { sort } = useContext(SortContext);
  const [userSettings, setUserSettings] = useState({});

  useEffect(() => {
    Meteor.call('getUserSettings', (err, res) => {
      if (err) {
        console.log('error getting settings ', err);
      }
      if (res) {
        setUserSettings(res);
      }
    });
  }, [currentUser]);
  const blocklist = userSettings?.blocklist || [];

  const { messages, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('userMessages');
    if (!Meteor.user()) {
      return { messages: [] };
    }
    if (!handle.ready()) {
      return { messages: [], isLoading: true };
    }
    const msgs = MessagesModel.find({ userId: currentUser && currentUser._id, isRead: false }).fetch();
    return { messages: msgs };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sort, messages.length]);

  const markAsRead = (messageId) => {
    Meteor.call('markAsRead', messageId);
  };

  if (isLoading) {
    return <Loading />;
  }
  messages.sort((a, b) => {
    if (sort.sort === -1) {
      return a.pubDate.getTime() - b.pubDate.getTime();
    } else {
      return b.pubDate.getTime() - a.pubDate.getTime();
    }
  });
  const filteredMessages = messages.filter((m) => {
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
  });
  if (currentUser) {
    return (
      <div className={animClass}>
        <List
          className="demo-loadmore-list"
          loading={isLoading}
          itemLayout="horizontal"
          dataSource={filteredMessages}
          renderItem={(item) => {
            const desc = `${moment(item.pubDate).format('dd, DD.MM.YY HH:mm')}\nFrom: ${item.creator}`;
            return (
              <List.Item>
                <b>{item.title}</b>
                <br />
                {desc}
                <br />
                <div dangerouslySetInnerHTML={{ __html: item.contentSnippet }} />
                <br />
                <span style={{ width: '100%' }}>
                  <div style={{ width: '50%', float: 'left' }}>
                    <Button style={{ width: '100%' }} type="primary" disabled={item.isMarkedRead} onClick={() => markAsRead(item._id)}>
                      Read!
                    </Button>
                  </div>
                  <div style={{ width: '50%', float: 'left' }}>
                    <Button style={{ width: '100%' }} type="secondary" href={item.link} target="_blank">
                      Visit
                    </Button>
                  </div>
                </span>
                <br />
              </List.Item>
            );
          }}
        />
      </div>
    );
  } else {
    return null;
  }
};

export default Messages;
