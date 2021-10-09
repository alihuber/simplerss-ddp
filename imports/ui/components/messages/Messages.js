import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useContext, useEffect } from 'react';
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
  if (currentUser) {
    if (messages.length !== 0) {
      return (
        <div className={animClass}>
          <List
            className="demo-loadmore-list"
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={messages}
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
      return 'no messages yet!';
    }
  } else {
    return null;
  }
};

export default Messages;
