import React, { createContext } from 'react';
import {initSubmitForm , useSubmitFormReducer} from './reducer/form';

export const DynamicFieldsContext = createContext(initSubmitForm);

export const DynamicFieldsProvider = ({children}) => {
    const [formState, dispatchFormState] = useSubmitFormReducer();

    const wrap = {
        formState,
        dispatchFormState
    };

    return (
        <DynamicFieldsContext.Provider value={wrap}>
            {children}
        </DynamicFieldsContext.Provider>
    );
}
