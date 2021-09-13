import { convertSuggestJob, convertToJob } from "../../global/helpers";

/***
 *
 *
 *
 */
export const UPDATE_FORM = 'UPDATE_FORM';
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const LOAD_COMPLETE = 'LOAD_COMPLETE';
export const LOADING = 'LOADING';
export const RESET = 'RESET';
export const JOB_SUGGEST = 'JOB_SUGGEST';

export const updateFormValues = (payload) => {
    return {
        type: UPDATE_FORM,
        payload
    };
};

export const updatePageAction = (payload) => {
    return {
        type: UPDATE_PAGE,
        payload
    };
};

export const loadCompletedAction = ({ jobs, totalJobs, page, totalPage, limit }) => {
    const newItems = [];
    for (const job of jobs) {
        if (job?.job_title) {
            let newJob = convertToJob(job);
            newItems.push(newJob);
        } else {
            newItems.push(job);
        }
    }
    return {
        type: LOAD_COMPLETE,
        payload: { jobs: newItems, totalJobs, page, totalPage, limit }
    };
};

export const loading = (payload) => {
    return {
        type: LOADING,
        payload
    };
};

export const resetAction = () => {
    return {
        type: RESET
    };
};

export const jobsSuggestAction = (jobs) => {
    return {
        type: JOB_SUGGEST,
        payload: convertSuggestJob(jobs)
    };
};