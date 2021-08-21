import { Layout } from 'antd';
import React from 'react';
const { Content } = Layout;

export default function (props) {
    return (
        <>
            <Content
                style={{
                    margin: '10px 16px',
                    padding: '33px 43px',
                    backgroundColor: 'white',
                }}
            >
                {props.children}
            </Content>
        </>
    );
}
