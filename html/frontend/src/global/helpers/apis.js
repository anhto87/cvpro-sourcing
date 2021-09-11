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
        let querys = `?filters=${keyword || ''}&job_type=${jobType || ''}&x_last=${xLast || ''}&sort_by=onlineDate:desc&page=${page}&locations=${address || ''}`;
        return await fetchApi(`/jobs/query${querys}`, { method: "GET" });
    }

    async getJobDetail({ jobId }) {
        return await fetchApi(`/jobs/${jobId}`, { method: "POST" });
    }

    async getTopJobDetail({ jobId }) {
        return await fetchApi(`/jobs/cvpro.top/${jobId}`, { method: "GET" });
    }

    async getJobsSuggest() {
        return await fetchApi(`/jobs/cvpro.top`, { method: "GET" });
    }
}

export default new API();