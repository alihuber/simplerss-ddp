import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useMediaQuery } from 'react-responsive';
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
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const maxWidth = window.innerWidth - 35;
  const maxWidthObj = isTabletOrMobile ? { maxWidth } : {};

  const { messagesLoading, messages } = useTracker(() => {
    const handle = Meteor.subscribe('userMessages', sort.sort);
    const msgs = MessagesModel.find({ userId: currentUser && currentUser._id, isRead: false }, { sort: { pubDate: sort.sort } }).fetch();
    msgs.sort((a, b) => {
      if (sort.sort === 1) {
        return a.pubDate > b.pubDate;
      } else {
        return b.pubDate > a.pubDate;
      }
    });

    return { messagesLoading: !handle.ready(), messages: msgs };
  }, [Meteor.userId(), sort.sort]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sort, messages.length]);

  const markAsRead = (messageId) => {
    Meteor.call('markAsRead', messageId);
  };

  if (messagesLoading) {
    return <Loading />;
  }
  if (currentUser) {
    if (messages.length !== 0) {
      return (
        <div className={animClass}>
          <List
            className="demo-loadmore-list"
            loading={messagesLoading}
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => {
              const desc = `${moment(item.pubDate).format('dd, DD.MM.YY HH:mm')}\nFrom: ${item.creator}`;
              if (isTabletOrMobile) {
                return (
                  <List.Item
                    actions={[
                      <Button style={{ width: maxWidth - 40 }} type="primary" disabled={item.isMarkedRead} onClick={() => markAsRead(item._id)}>Read!</Button>,
                      <Button style={{ width: maxWidth - 40 }} type="secondary" href={item.link} target="_blank">Visit</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={desc}
                    />
                    <div style={maxWidthObj} dangerouslySetInnerHTML={{ __html: item.contentSnippet }} />
                  </List.Item>
                );
              } else {
                return (
                  <List.Item>
                    <b>{item.title}</b>
                    <br />
                    {desc}
                    <br />
                    <div dangerouslySetInnerHTML={{ __html: item.contentSnippet }} />
                    <br />
                    <p>
                      <div style={{ width: '50%', float: 'left' }}>
                        <Button style={{ width: '100%' }} type="primary" disabled={item.isMarkedRead} onClick={() => markAsRead(item._id)}>Read!</Button>
                      </div>
                      <div style={{ width: '50%', float: 'left' }}>
                        <Button style={{ width: '100%' }} type="secondary" href={item.link} target="_blank">Visit</Button>
                      </div>
                    </p>
                    <br />
                  </List.Item>
                );
              }
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
