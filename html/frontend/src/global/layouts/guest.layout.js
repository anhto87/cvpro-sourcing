import React from 'react';
import { Layout } from 'antd';
export const GuestLayout = (props) => {
    return <Layout style={{ minHeight: '100vh' }}>{props.children}</Layout>;
};
