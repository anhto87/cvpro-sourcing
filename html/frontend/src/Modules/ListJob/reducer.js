/***
 * 
 * 
 * 
 * 
 */

import { LOADING, LOAD_COMPLETE, UPDATE_FORM, UPDATE_PAGE, RESET, JOB_SUGGEST } from "./actions";

const initForm = { keyword: null, address: null, time: null, jobType: null, page: null };
export const initialValues = {
    form: initForm,
    jobs: [],
    isLoading: false,
    totalJobs: 0,
    totalPage: 0,
    limit: 0,
    isFilter: false,
    jobsSuggest: []
};

export const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case UPDATE_FORM:
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
        case LOADING:
            return {
                ...state,
                isLoading: payload
            }
        case RESET:
            return {
                ...initialValues
            }
        case JOB_SUGGEST:
            return {
                ...state,
                jobsSuggest: payload
            }
        default:
            return state
    }
}