/**
 * 
 * 
 * 
 */
import { fetchApi, fetchApiCustomURL } from '../utils';

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

    async getJobsSuggest() {
        return await fetchApiCustomURL(`https://nhanlucvietnam.net/api/jobs`, {
            method: "GET",
            mode: 'no-cors',
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
        });
    }
}

export default new API();