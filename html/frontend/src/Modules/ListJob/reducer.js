/***
 * 
 * 
 * 
 * 
 */

import { LOADDING, LOAD_COMPLETE, UPDATEFORM, UPDATE_PAGE, RESET } from "./actions";
import { FilterTimes, FilterJobTypes } from '../../global/helpers';

const initForm = { keyword: null, address: null, time: null, jobType: null, page: null };
export const initialValues = {
    form: initForm,
    jobs: [],
    isLoading: false,
    totalJobs: 0,
    totalPage: 0,
    limit: 0,
    isFilter: false
};

export const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case UPDATEFORM:
            const newState = {
                ...state,
                form: {
                    ...payload
                }
            }
            return newState;
        case UPDATE_PAGE:
            return {
                ...state,
                form: {
                    ...state.form,
                    page: payload,
                },
                jobs: []
            }
        case LOAD_COMPLETE:
            const page = payload?.page || 1;
            const jobs = payload?.jobs || [];
            const totalJobs = payload?.totalJobs || 0;
            const limit = payload?.limit || 0;
            const totalPage = Math.ceil(totalJobs / limit);
            return {
                ...state,
                form: {
                    ...state.form,
                    page
                },
                jobs,
                totalJobs,
                totalPage,
                limit,
                isLoading: false
            }
        case LOADDING:
            return {
                ...state,
                isLoading: payload
            }
        case RESET:
            return {
                ...initialValues
            }
        default:
            return state
    }
}