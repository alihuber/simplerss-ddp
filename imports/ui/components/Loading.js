import React from 'react';
import { ClipLoader } from 'react-spinners';
import { Row } from 'antd';

const Loading = () => {
  return (
    <Row
      type="flex"
      justify="center"
      align="middle"
      style={{ height: '35rem' }}
    >
      <ClipLoader color="#030e21" loading size={70} />
    </Row>
  );
};
export default Loading;
