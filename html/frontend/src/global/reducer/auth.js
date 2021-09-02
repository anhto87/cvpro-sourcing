import { useReducer } from 'react';
import { reactLocalStorage } from 'reactjs-localstorage';
import { UPDATE_LOGGED, RELOAD_LOGGED } from './auth.actions';
import _ from 'lodash';

const token = reactLocalStorage.get('token');

export const initAuth = {
    stateAuth: {
        authenticated: !_.isEmpty(token),
    },
    dispatchAuth: () => {},
};

const reducer = (state, action) => {
    switch (action.type) {
        case UPDATE_LOGGED:
            reactLocalStorage.set('token', action.token);

            return {
                ...state,
                authenticated: true,
                token: action.token,
            };
        case RELOAD_LOGGED:
            const token = reactLocalStorage.get('token');
            return {
                ...state,
                authenticated: true,
                token: token,
            };
        default:
            return {
                ...state,
            };
    }
};

export const useAuthReducer = () => {
    return useReducer(reducer, initAuth.stateAuth);
};
