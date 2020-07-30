import React, { useContext } from 'react';
import { ClipLoader } from 'react-spinners';
import { Row } from 'antd';
import AnimationContext from '../contexts/AnimationContext';

const Loading = () => {
  const animClass = useContext(AnimationContext);
  return (
    <div className={animClass}>
      <Row
        type="flex"
        justify="center"
        align="middle"
        style={{ height: '35rem' }}
      >
        <ClipLoader color="#030e21" loading size={70} />
      </Row>
    </div>
  );
};
export default Loading;
