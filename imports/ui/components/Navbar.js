import React, { useContext, useState, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Menu, Badge } from 'antd';
import UserOutlined from '@ant-design/icons/UserOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SortAscendingOutlined from '@ant-design/icons/SortAscendingOutlined';
import SortDescendingOutlined from '@ant-design/icons/SortDescendingOutlined';
import RedoOutlined from '@ant-design/icons/RedoOutlined';
import { toast } from 'react-toastify';
import CurrentUserContext from '../contexts/CurrentUserContext';
import ServerConnectionContext from '../contexts/ServerConnectionContext';
import SortContext from '../contexts/SortContext';

const { SubMenu } = Menu;

const handleSettings = (history) => {
  history.push('/settings');
};

const handleLogin = (history) => {
  history.push('/login');
};

const handleUsers = (history) => {
  history.push('/users');
};

const handleHome = (history) => {
  history.push('/');
};

const handleMessages = (history) => {
  history.push('/messages');
};

const handleLogout = (history) => {
  Meteor.logout(() => {
    toast.success('Logout successful!', {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    history.push('/');
  });
};

const cleanRead = () => {
  Meteor.call('setRead');
};

const userMenu = (currentUser, history, sort, setSort, location) => {
  const newSort = sort.sort === -1 ? { sort: 1 } : { sort: -1 };
  const onMessages = location.pathname.includes('messages');
  if (!currentUser || !currentUser._id) {
    return (
      <Menu.Item
        key="2"
        style={{ float: 'right' }}
        onClick={() => handleLogin(history)}
      >
        Login
      </Menu.Item>
    );
  }
  if (currentUser) {
    return (
      <SubMenu
        style={{ float: 'right' }}
        key="sub1"
        title={(
          <span>
            <MenuOutlined />
            {' '}
            <span>Menu</span>
          </span>
        )}
      >
        {currentUser?.admin ? (
          <Menu.Item
            key="3"
            onClick={() => handleUsers(history)}
          >
            <span>
              <UserOutlined />
              {' '}
              <span>Users</span>
            </span>
          </Menu.Item>
        ) : null}
        <Menu.Item key="8">
          User:
          {' '}
          {currentUser.username}
        </Menu.Item>
        {onMessages ? (
          <Menu.Item key="9" onClick={() => setSort(newSort)}>
            Sort:
            {' '}
            {sort.sort === 1 ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          </Menu.Item>
        ) : null}
        {onMessages ? (
          <Menu.Item key="10" onClick={() => cleanRead()}>
            Clean read
          </Menu.Item>
        ) : null}
        <Menu.Item key="4" onClick={() => handleSettings(history)}>
          <span>
            <SettingOutlined />
            {' '}
            <span>Settings</span>
          </span>
        </Menu.Item>
        <Menu.Item key="5" onClick={() => handleLogout(history)}>
          <span>
            <LogoutOutlined />
            {' '}
            <span>Logout</span>
          </span>
        </Menu.Item>
      </SubMenu>
    );
  }
};

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = Meteor.setInterval(tick, delay);
      return () => Meteor.clearInterval(id);
    }
  }, [delay]);
}

const Navbar = () => {
  const history = useHistory();
  const location = useLocation();
  const currentUser = useContext(CurrentUserContext);
  const connectionStatus = useContext(ServerConnectionContext);
  const { setSort, sort } = useContext(SortContext);
  const [count, setCount] = useState(0);
  useInterval(() => {
    if (Meteor.userId()) {
      Meteor.call('countMessagesForUser', (err, res) => {
        setCount(res);
      });
    }
  }, 5000);

  return (
    <Menu theme="dark" mode="horizontal">
      <Menu.Item key="1" onClick={() => handleHome(history)}>
        Home
      </Menu.Item>
      {connectionStatus === 'connected' ?
        userMenu(currentUser, history, sort, setSort, location) :
        <Menu.Item key="7" style={{ float: 'right' }} onClick={() => Meteor.reconnect()}><RedoOutlined /></Menu.Item>}
      {currentUser ? (
        <Menu.Item
          key="6"
          style={{ float: 'right' }}
          onClick={() => handleMessages(history)}
        >
          <Badge count={count} overflowCount={999}>
            <MessageOutlined style={{ color: 'white' }} />
          </Badge>
        </Menu.Item>
      )
        : null}
    </Menu>
  );
};
export default Navbar;
