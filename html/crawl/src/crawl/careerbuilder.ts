import puppeteer from 'puppeteer';
import config from '../database/config';
import { Job, saveConfig, saveJob } from '../database/entities';
import Logger from './Log';
import { closePage, convertToJob, createPage, delay, screenShotLog, scrollToBottom } from './helper';
import { URLConstants, URLCraw } from './constants/constant';

export type CareerBuilderJob = {
    jobId?: string;
    jobTitle?: string;
    companyLogo?: string;
    company?: string;
    companyId?: string;
    jobDescription?: string;
    jobRequirement?: string;
    salaryMax?: number;
    salaryMin?: number;
    salary?: string;
    experience?: string;
    jobType?: string;
    jobLocations?: string[];
    locations?: string[];
    categories?: string[];
    skills?: string[];
    benefits?: any[];
    data?: any;
    domain?: string;
    link?: string;
    publishedDate?: string;
    expiredDate?: string;
    onlineDate?: string;
}

const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        const pages = document.querySelectorAll('div.pagination ul li');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className === 'active';
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            return pages[activePage + 1].querySelector('a')?.getAttribute('href');
        }
        return null;
    })
    Logger.info(`Next Page ${nextPageUrl}`)
    return nextPageUrl;
}

const getJobs = (): CareerBuilderJob[] => {
    let list = document.querySelectorAll('div.jobs-side-list div.job-item');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div.title a.job_link');
        const companyEle = element.querySelector('div.image a');
        const locationEle = element.querySelectorAll('div.location ul li');

        if (titleEle && companyEle) {
            const jobId = titleEle.getAttribute('data-id') || '';
            const jobTitle = titleEle.getAttribute('title') || '';
            const companyLogo = element.querySelector('div.image a img')?.getAttribute('src') || '';
            const company = companyEle.getAttribute('title') || '';
            const onlineDate = element.querySelector('div.time time')?.textContent?.trim() || '';
            const link = titleEle.getAttribute('href') || '';
            const domain = document.domain;
            const locations = Array.from(locationEle).map(ele => ele.textContent?.trim() || '');
            jobs.push({ jobId, jobTitle, companyLogo, company, link, domain, jobLocations: locations, locations, onlineDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    enum CareerBuilderConstant {
        expiredDate = 'H???t h???n n???p',
        catagories = 'Ng??nh ngh???',
        jobType = 'H??nh th???c',
        salaly = 'L????ng',
        experience = 'Kinh nghi???m',
    }
    const getInfoValue = (key: string, queryElement: string, queryValue: string, array: Element[]) => {
        const index = array.findIndex(ele => ele.querySelector(queryElement)?.textContent?.includes(key) || false);
        if (index > -1) {
            if (key === CareerBuilderConstant.catagories) {
                return Array.from(array[index].querySelectorAll('a')).map(ele => ele.textContent?.trim() || '')
            }
            return array[index].querySelector(queryValue)?.textContent?.trim() || '';
        }
        return '';
    }

    let jobDetailContentEle = document.querySelectorAll('div.detail-row div.content');

    //case template html 1
    if (jobDetailContentEle.length > 0) {
        const benefitsDiv = document.querySelector('div.detail-row box-welfares');
        const jobDescriptionDiv = document.querySelector('div.full-content');
        const jobDescription = `<div>${benefitsDiv?.outerHTML || ''}${jobDescriptionDiv?.outerHTML || ''}</div>`;
        const elemobile = document.querySelector('div.box-info tbody tr.show-in-mobile td.content');
        elemobile?.remove();
        let queryElement = 'td.name p';
        let queryValue = 'td.content p';
        const jobInfoElement = Array.from(document.querySelectorAll('div.box-info div.table table tbody tr'));
        const expiredDate = getInfoValue(CareerBuilderConstant.expiredDate, queryElement, queryValue, jobInfoElement) as string;
        const experience = getInfoValue(CareerBuilderConstant.experience, queryElement, queryValue, jobInfoElement) as string;
        const jobType = getInfoValue(CareerBuilderConstant.jobType, queryElement, queryValue, jobInfoElement) as string;
        const salary = getInfoValue(CareerBuilderConstant.salaly, queryElement, queryValue, jobInfoElement) as string;
        const categories = getInfoValue(CareerBuilderConstant.salaly, queryElement, queryValue, jobInfoElement) as string[];
        const skillEles = document.querySelectorAll('div.job-tags ul li a');
        const skills = Array.from(skillEles).map(ele => (ele.getAttribute('title') || '').trim());
        const benefitsEles = document.querySelectorAll('div.detail-row.box-welfares ul li');
        const benefits = Array.from(benefitsEles).map(ele => (ele.textContent || '').trim());
        return { jobType, jobDescription, categories, experience, expiredDate, skills, benefits, salary };
    }

    //case template html 2
    jobDetailContentEle = document.querySelectorAll('section.job-detail-content div.detail-row');
    if (jobDetailContentEle.length > 0) {
        const jobDescription = `<section class="job-detail-content">${Array.from(jobDetailContentEle).map(ele => ele.outerHTML)}</section>`;

        let jobInfoElement = Array.from(document.querySelectorAll('div.detail-box.has-background ul li'));
        let queryElement = 'strong';
        let queryValue = 'p';
        if (jobInfoElement.length <= 0) {
            jobInfoElement = Array.from(document.querySelectorAll('div.boxtp.info-career ul.info li'));
            if (jobInfoElement.length > 0) {
                queryElement = 'b';
                queryValue = 'div.value';
            } else {
                jobInfoElement = Array.from(document.querySelectorAll('#info-career-desktop ul li'));
                if (jobInfoElement.length > 0) {
                    queryElement = 'label';
                    queryValue = 'span';
                }
            }

        }
        const expiredDate = getInfoValue(CareerBuilderConstant.expiredDate, queryElement, queryValue, jobInfoElement) as string;
        const experience = getInfoValue(CareerBuilderConstant.experience, queryElement, queryValue, jobInfoElement) as string;
        const jobType = getInfoValue(CareerBuilderConstant.jobType, queryElement, queryValue, jobInfoElement) as string;
        const salary = getInfoValue(CareerBuilderConstant.salaly, queryElement, queryValue, jobInfoElement) as string;
        const categories = getInfoValue(CareerBuilderConstant.salaly, queryElement, queryValue, jobInfoElement) as string[];
        const skillEles = document.querySelectorAll('div.job-tags ul li a');
        const skills = Array.from(skillEles).map(ele => (ele.getAttribute('title') || '').trim());
        const benefitsEles = document.querySelectorAll('.job-detail-content div.detail-row ul.welfare-list li');
        const benefits = Array.from(benefitsEles).map(ele => (ele.textContent || '').trim());
        return { jobDescription, categories, experience, jobType, salary, expiredDate, benefits, skills }
    }

    return {};
}

async function scapeDetail(link: string, browser: puppeteer.Browser) {
    let pageDetail = await createPage(browser);
    try {
        if (!pageDetail) {
            return null
        }
        await pageDetail.goto(link, { waitUntil: 'networkidle0', timeout: config.timeout });
        const jobDetail = await pageDetail.evaluate(getJobDetail);
        await closePage(pageDetail);
        pageDetail = null;
        return jobDetail
    } catch (error) {
        Logger.error(`link: ${link} ${error}`)
        await pageDetail?.close()
        pageDetail = null;
        return null
    }
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page) {
    const { maxDelayTime, minDelayTime } = config;
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: config.timeout });
        await scrollToBottom(page);
        const jobs = await page.evaluate(getJobs);
        let nextPage = await getNextPage(page) || URLCraw.careerbuilder;
        if (jobs.length === 0) {
            await screenShotLog(page, URLConstants.careerbuilder);
        }
        await closePage(page);
        const items: Job[] = [];
        for (const job of jobs) {
            const jobDetail = await scapeDetail(job.link!, browser);
            if (!jobDetail) {
                return items;
            }
            const item = convertToJob({ ...job, ...jobDetail })
            await saveJob(item);
            const number = (Math.floor(Math.random() * (maxDelayTime - minDelayTime)) + minDelayTime) * 1000;
            await delay(number)
            items.push(item);
        }
        await saveConfig({ name: URLConstants.careerbuilder, page: nextPage });
        return items;
    } catch (err) {
        Logger.error(err);
        return []
    }

}

const Careerbuilder = { getJobInPage, getNextPage }

export default Careerbuilder;