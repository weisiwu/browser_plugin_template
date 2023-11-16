import React from 'react';
import { Button, Result } from 'antd';

const prefix = 'config-page';
const onClick = () => {
  window.open('', '_blank');
}

export const ErrorFallback = () => {
  return (
    <Result
      status="error"
      title="插件异常啦"
      subTitle="修bug~"
      extra={
        <Button onClick={onClick} type="primary" key="console"></Button>
      }>
    </Result>
  );
};