import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { AutoForm } from 'uniforms-antd';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Typography } from 'antd';
import SimpleSchema from 'simpl-schema';
import { Settings as SettingsModel } from '../../../api/settings/constants';
import CurrentUserContext from '../../contexts/CurrentUserContext';
import AnimationContext from '../../contexts/AnimationContext';
import Loading from '../Loading';

const { Title } = Typography;

const subscriptionSchema = new SimpleSchema({
  url: {
    type: String,
    required: true,
  },
});

const settingsSchema = new SimpleSchema({
  interval: {
    type: String,
    defaultValue: '60',
    allowedValues: ['1', '2', '10', '15', '30', '45', '60', '120'],
  },
  blocklist: {
    type: Array,
  },
  'blocklist.$': { type: String },
  folders: {
    type: Array,
  },
  'folders.$': { type: Object },
  'folders.$.folderName': { type: String },
  'folders.$.subscriptions': { type: Array },
  'folders.$.subscriptions.$': { type: subscriptionSchema },
});

const bridge = new SimpleSchema2Bridge(settingsSchema);

const Settings = () => {
  const animClass = useContext(AnimationContext);
  const currentUser = useContext(CurrentUserContext);

  const settingsLoading = useTracker(() => {
    const handle = Meteor.subscribe('userSettings');
    return !handle.ready();
  }, []);

  const userSettings = useTracker(() => SettingsModel.findOne({ userId: currentUser && currentUser._id }), [Meteor.userId()]);

  const handleSubmit = (doc, userId) => {
    Meteor.call('updateSettings', doc, userId, (err) => {
      if (err) {
        toast.error('Update not successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } else {
        toast.success('Update successful!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    });
  };

  const EditSettingsForm = ({ model, userId }) => (
    <AutoForm
      schema={bridge}
      onSubmit={(doc) => handleSubmit(doc, userId)}
      model={model}
    />
  );
  EditSettingsForm.propTypes = {
    model: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
  };

  const model = {};
  model.interval = userSettings?.interval || '60';
  model.folders = userSettings?.folders || [];
  model.blocklist = userSettings?.blocklist || [];

  if (settingsLoading) {
    return <Loading />;
  }
  if (currentUser) {
    return (
      <div className={animClass}>
        <Title level={2}>Settings</Title>
        <EditSettingsForm model={model} userId={currentUser._id} />
      </div>
    );
  } else {
    return (
      <div className={animClass}>
        <Title level={2}>Settings</Title>
      </div>
    );
  }
};

export default Settings;
