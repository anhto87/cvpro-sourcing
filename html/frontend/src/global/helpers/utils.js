/***
 * 
 * 
 * 
 * 
 */

import { FilterJobTypes, FilterTimes } from "./constants";

export const getListJobURL = ({ keyword, address, time, page, jobType }) => {
    let querys = { keyword, address };
    if (time && time !== FilterTimes.all) {
        querys['t'] = time;
    }

    if (jobType && jobType !== FilterJobTypes.all) {
        querys['type'] = jobType;
    }
    if (page !== 1) {
        querys['page'] = page;
    }
    let searchParams = new URLSearchParams(querys).toString();
    return `/tim-viec?${searchParams}`;
}

export const getJobDetailURL = ({ jobId }) => {
    return `/tim-viec/${jobId}`;
}