import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import Layout from './Layout';
import Routing from './Routing';
import AnimationContext from '../contexts/AnimationContext';
import CurrentUserContext from '../contexts/CurrentUserContext';
import ServerConnectionContext from '../contexts/ServerConnectionContext';
import SortContext from '../contexts/SortContext';

toast.configure();

const Root = () => {
  const layout = Layout;
  const animClass =
    window.innerWidth > 860
      ? 'ract-transition fade-in'
      : 'ract-transition swipe-right';

  const currentUser = useTracker(() => {
    return Meteor.users.findOne(
      { _id: Meteor.userId() },
      { fields: { username: 1, admin: 1, createdAt: 1 } },
    );
  }, [Meteor.userId()]);

  const serverConnection = useTracker(() => {
    return Meteor.connection.status().status;
  }, [Meteor.connection.status().connected]);

  useTracker(() => {
    const handle = Meteor.subscribe('currentUser');
    return !handle.ready();
  }, [Meteor.userId()]);

  const [sort, setSort] = useState({ sort: -1 });

  return (
    <>
      <ServerConnectionContext.Provider value={serverConnection}>
        <AnimationContext.Provider value={animClass}>
          <CurrentUserContext.Provider value={currentUser}>
            <SortContext.Provider value={{ sort, setSort }}>
              <Routing LayoutComponent={layout} />
            </SortContext.Provider>
          </CurrentUserContext.Provider>
        </AnimationContext.Provider>
      </ServerConnectionContext.Provider>
      <ToastContainer autoClose={3000} />
    </>
  );
};

export default Root;
