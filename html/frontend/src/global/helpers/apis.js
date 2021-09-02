/**
 * 
 * 
 * 
 */
import { fetchApi } from '../utils';

class API {

    async getTotalJob(keyword) {
        let res = await fetchApi('/total_jobs', { method: "GET" });
        return res;
    }

    async getListJobs({ keyword, address, page = 1, jobType, xLast }) {
        console.log(`ListJobs `, { keyword, address, page, jobType, xLast });
        let querys = `?filters=${keyword || ''}&job_type=${jobType || ''}&x_last=${xLast || ''}&sort_by=onlineDate:desc&page=${page}&locations=${address || ''}`;
        return await fetchApi(`/jobs/query${querys}`, { method: "GET" });
    }
}

export default new API();