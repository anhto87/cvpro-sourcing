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

export const getJobDetailURL = (item) => {
    const jobTitleSlug = item?.jobTitleSlug || slugify(item.jobTitle);
    return `/tim-viec/${jobTitleSlug || ''}-${item._id}`;
}

export const slugify = (str: string, separator = "-") => {
    return str
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, separator);
};