/***
 * 
 * 
 * 
 */

export const ADD_SEARCH = "ADD_SEARCH";
export const UPDATEFORM = "UPDATEFORM";
export const UPDATE_PAGE = "UPDATE_PAGE";
export const LOAD_COMPLETE = "LOAD_COMPLETE";
export const LOADDING = "LOADDING";
export const RESET = "RESET";

export const updateFormValues = (payload) => {
    return {
        type: UPDATEFORM,
        payload
    }
}

export const updatePageAction = (payload) => {
    return {
        type: UPDATE_PAGE,
        payload
    }
}

export const loadCompletedAction = ({ jobs, totalJobs, page, totalPage, limit }) => {
    return {
        type: LOAD_COMPLETE,
        payload: { jobs, totalJobs, page, totalPage, limit }
    }
}

export const loading = (payload) => {
    return {
        type: LOADDING,
        payload
    }
}

export const resetAction = () => {
    return {
        type: RESET
    }
}