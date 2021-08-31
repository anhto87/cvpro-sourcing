import React from 'react';
import { Layout } from 'antd';
export const GuestLayout = (props) => {
    return <Layout style={{ minHeight: '100vh', background: 'white' }}>{props.children}</Layout>;
};
