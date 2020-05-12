import React, { useContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { useHistory } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Menu, Badge, Affix } from 'antd';
import UserOutlined from '@ant-design/icons/UserOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import RedoOutlined from '@ant-design/icons/RedoOutlined';
import { toast } from 'react-toastify';
import CurrentUserContext from '../contexts/CurrentUserContext';
import ServerConnectionContext from '../contexts/ServerConnectionContext';

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

const userMenu = (currentUser, history) => {
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

const Navbar = () => {
  const history = useHistory();
  const currentUser = useContext(CurrentUserContext);
  const connectionStatus = useContext(ServerConnectionContext);
  const messageCount = useTracker(() => {
    if (currentUser) {
      Meteor.subscribe('messageCount', currentUser._id);
      return Counts.get('messageCountForUser');
    }
  }, [currentUser && currentUser._id]);
  return (
    <Menu theme="dark" mode="horizontal">
      <Menu.Item key="1" onClick={() => handleHome(history)}>
        Home
      </Menu.Item>
      {connectionStatus === 'connected' ?
        userMenu(currentUser, history) :
        <Menu.Item key="7" style={{ float: 'right' }} onClick={() => Meteor.reconnect()}><RedoOutlined /></Menu.Item>}
      {currentUser ? (
        <Menu.Item
          key="6"
          style={{ float: 'right' }}
          onClick={() => handleMessages(history)}
        >
          <Badge count={messageCount}>
            <MessageOutlined />
          </Badge>
        </Menu.Item>
      )
        : null}
    </Menu>
  );
};
export default Navbar;
