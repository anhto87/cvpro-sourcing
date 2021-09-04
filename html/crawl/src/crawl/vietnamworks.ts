import axios, { Method } from 'axios';
import { URLConstants } from './constants/constant';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import {createPuppeteerBrowser, slugify} from "./helper";

interface APIRequestConfig {
    method: string;
    url: string;
    headers: any;
    data?: any;
}

interface VietnamWorkBenefit {
    benefitIconName: string;
    benefitName: string;
    benefitValue: string;
    benefitId: number;
}

interface VietNamWorkJob {
    jobId?: number;
    jobTitle?: string;
    companyLogo?: string;
    company?: string;
    companyId?: number;
    jobDescription?: string;
    jobRequirement?: string;
    publishedDate?: number;
    salaryMax?: number;
    salaryMin?: number;
    jobLocations?: string[];
    locations?: string[];
    categories?: string[];
    expiredDate?: number;
    skills?: string[];
    jobLevelVI?: string;
    locationVIs?: string[];
    locationIds?: number[];
    onlineDate?: number;
    benefits?: VietnamWorkBenefit[];
    serviceCode?: string[];
    typeWorkingId?: number;
    categoryVIs?: string[];
    priorityOrder?: number;
    alias?: string;
    timestamp?: string;
    priorityOrder35?: number;
    classifiedRoles?: any[];
    jobLevelId?: number;
    userId?: number;
    jobLevel?: string;
    categoryIds?: number[];
    classifiedConfidenceSkills?: any[];
    classifiedSkills?: any[];
    objectID?: number;
    jobTitleSlug?:string;
}

interface VietNamWorkResultItem {
    hits?: [any];
    nbHits?: number;
    page?: number;
    nbPages?: number;
    hitsPerPage?: number;
    exhaustiveNbHits?: boolean;
    query?: string;
    params?: string;
    index?: string;
    processingTimeMS?: number;
}

interface VietNamWorkData {
    results?: VietNamWorkResultItem[];
}

const convertToJob = (job: VietNamWorkJob, domain: string): Job => {
    const jobId = `${job.jobId}`;
    const jobTitle = job.jobTitle || '';
    const companyLogo = job.companyLogo || '';
    const company = job.company || '';
    const companyId = `${job.companyId}`;
    const jobDescription = job.jobDescription || '';
    const jobRequirement = job.jobRequirement || '';
    const publishedDate = job.publishedDate ? new Date(job.publishedDate! * 1000) : new Date();
    const salaryMax = job.salaryMax || 0;
    const salaryMin = job.salaryMin || 0;
    const experience = undefined;
    const jobType = '';
    const jobLocations = job.jobLocations || [];
    const locations = job.locations || [];
    const categories = job.categories || [];
    const expiredDate = job.expiredDate ? new Date(job.expiredDate! * 1000) : new Date();
    const onlineDate = job.onlineDate ? new Date(job.onlineDate! * 1000) : new Date();
    const skills = job.skills || [];
    const benefits = (job.benefits || []).map(ele => ele.benefitValue);
    const data = job;
    const jobTitleSlug = job.alias;
    const link = `https://www.vietnamworks.com/${jobTitleSlug}-${jobId}-jv`
    const locationsEN = locations.map(ele => slugify(ele, ' '));
    const expiredTimestamp = job.expiredDate;
    const publishedTimestamp = job.publishedDate;
    const onlineTimestamp = job.onlineDate;

    return {
        jobId,
        jobTitle,
        companyLogo,
        company,
        companyId,
        jobDescription,
        jobRequirement,
        publishedDate,
        salaryMax,
        salaryMin,
        experience,
        jobType,
        jobLocations,
        locations,
        categories,
        expiredDate,
        onlineDate,
        skills,
        benefits,
        data,
        domain,
        link,
        jobTitleSlug,
        locationsEN,
        expiredTimestamp,
        onlineTimestamp,
        publishedTimestamp
    }
}

/* 
* Body:
    {
        "requests": [
            {
                "indexName": "vnw_job_v2",
                "params": "query=&hitsPerPage=200&attributesToRetrieve=%5B%22*%22%2C%22-jobRequirement%22%2C%22-jobDescription%22%5D&attributesToHighlight=%5B%5D&query=&facetFilters=%5B%5D&filters=&numericFilters=%5B%22expiredDate%20%3E%3D%201628959997%22%5D&page=0&restrictSearchableAttributes=%5B%22jobTitle%22%2C%22skills%22%2C%22company%22%5D"
            }
        ]
    }
*/
const getBody = (obj: string, page: number = 0) => {
    try {
        let params: string = obj || "";
        params = params.replace('%2C%22-jobRequirement%22%2C%22-jobDescription%22', '');
        params = params.replace('page=0', `page=${page}`);
        return params
    } catch (error) {
        Logger.error(`Vietnamwork func createNewBody api ${error}`);
        return null;
    }
}

const apiGetDataConfig = async (url: string, pageNumber: number = 0): Promise<APIRequestConfig | null> => {
    try {
        Logger.info(new Date().toISOString(), "Vietnamwork start load apiGetDataConfig")
        const browser = await createPuppeteerBrowser();
        const page = await browser.newPage();
        let apiRequest: APIRequestConfig | null = null;

        await page.setRequestInterception(true);
        page.on('request', request => {
            request.continue()
        });

        //Find api get data
        page.on('requestfinished', async (request) => {
            const response = request.response();
            const requestPostData = request.postData();
            const statusCode = response?.status() || 404;

            if (requestPostData?.includes('indexName') && statusCode < 300) {
                const method = request.method();
                const data = getBody(requestPostData!, pageNumber);
                const url = request.url();
                const headers = request.headers();
                apiRequest = { url, data, method, headers }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle0' });
        await browser.close();
        Logger.info("Vietnamwork load apiGetDataConfig done")
        return apiRequest;
    } catch (err) {
        Logger.error(`Vietnamwork load apiGetDataConfig error ${err}`);
        return null;
    }
}

async function getJobs(config: APIRequestConfig): Promise<VietNamWorkResultItem | null> {
    let res = await axios({ url: config.url, data: config.data, headers: config.headers, method: config.method as Method });
    let results = (res.data as VietNamWorkData).results || [];
    let obj = results.length > 0 ? results[0] : null;
    if (obj) {
        Logger.info(`Vietnamwork getJobs loaded ${config.url} ${config.data} ${obj.hits?.length || 0}, nbPages ${obj.nbPages}`);
        return obj;
    }
    Logger.info("Vietnamwork getJobs failed");
    return null
}

export async function VietNamWorkWithPage(url: string, page: number = 0): Promise<any> {
    try {
        let config = await apiGetDataConfig(url, page);
        if (config) {
            let jobs = (await getJobs(config))?.hits || [];
            for (const job of jobs) {
                await saveJob(convertToJob(job, URLConstants.vietnamWork))
            }
            Logger.info("VietNamWorkWithPage crawl data done");
            return true;
        }
        Logger.info("VietNamWorkWithPage crawl data fail");
        return false;
    } catch (error) {
        Logger.error(error);
        return false;
    }
}

export async function VietNamWorkAll(url: string) {
    try {
        let config = await apiGetDataConfig(url, 0);
        if (config) {
            let res = await getJobs(config);
            let jobs = res?.hits || [];
            for (const job of jobs) {
                await saveJob(convertToJob(job, URLConstants.vietnamWork))
            }

            const maxPage = res?.nbPages || 0;
            for (let index = 1; index <= maxPage; index++) {
                let newData = getBody(config.data as string, index);
                Logger.info(`VietNamWorkAll start load url: ${config.url} page: ${index}`);
                let newJobs = (await getJobs({ ...config, data: newData }))?.hits || [];
                for (const job of newJobs) {
                    await saveJob(convertToJob(job, URLConstants.vietnamWork))
                }
                Logger.info(`VietNamWorkAll loaded url: ${config.url} page: ${index} jobs: ${newJobs.length}`);
            }
            Logger.info("VietNamWorkAll crawl data done");
            return true;
        }
        Logger.error("VietNamWorkAll crawl data fail");
    } catch (error) {
        Logger.error(error);
        Logger.error("Vietnamwork crawl data fail ", error);
        return false;
    }
}