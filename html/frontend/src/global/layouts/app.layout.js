import React from 'react';
import { useContext } from 'react';
import { GlobalContext } from '../context';
import { Layout1 } from './layout1.layout';
import { GuestLayout } from './guest.layout';

export const AppLayout = (props) => {
    const { stateAuth } = useContext(GlobalContext);

    if (stateAuth.authenticated) {
        return <Layout1 {...props} />;
    }

    return <GuestLayout {...props} />;
};
