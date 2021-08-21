import { useReducer } from 'react';
import _ from 'lodash';
import Countries from '@src/global/dataset/countries.json';
import ProvincesVN from '@src/global/dataset/provinces_vn.json';

const cities = _.map(ProvincesVN, (province) => {
    return {
        value: province.id,
        label: _.get(province, '_name', ''),
    };
});

export const initSubmitForm = {
    formState: {
        isSubmitting: false,
        countries: Countries,
        cities: cities,
        currCountryCode: null,
        file: null,
        fileList: [],
        form: null,
        configLayout: {
            labelAlight: 'left',
            inputSize: 'default',
            levelSubHeading: 5
        },
        fieldGroups: []
    },
    dispatchFormState: () => {},
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SEARCH_COUNTRIES':
            const countries = _.filter(Countries, (country) => {
                const currCountryLabel = _.lowerCase(
                    _.get(country, 'label', '')
                );
                if (currCountryLabel.indexOf(action.value) > -1) {
                    return country;
                }
            });

            return {
                ...state,
                countries: countries,
            };
        case 'UPDATE_CURR_COUNTRY':
            return {
                ...state,
                currCountryCode: action.value,
            };
        case 'HANDLER_UPLOAD_FILE':
            state.fileList.push(action.file);
            return {
                ...state,
                file: action.file,
            };
        case 'HANDLER_CLEAR_FILE':
            return {
                ...state,
                file: null,
                fileList: [],
            };
        case 'SET_INIT_FORM':
            return {
                ...state,
                form: action.form,
                fieldGroups: action.fieldGroups
            }
        default:
            return {
                ...state,
            };
    }
};

export const useSubmitFormReducer = () => {
    return useReducer(reducer, initSubmitForm.formState);
};
