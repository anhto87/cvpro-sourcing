import React from 'react';
import { initAuth, useAuthReducer } from './reducer/auth';
const init = {
    ...initAuth,
};

export const GlobalContext = React.createContext(init);

export const GlobalProvider = (props) => {
    const [stateAuth, dispatchAuth] = useAuthReducer();

    const wrap = {
        stateAuth,
        dispatchAuth,
    };

    return (
        <GlobalContext.Provider value={wrap}>
            {props.children}
        </GlobalContext.Provider>
    );
};
