import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import config from '../database/config';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, scrollToBottom, setHeader } from './helper';


const getNextPage = async (page: puppeteer.Page) => null;

const getTotalItems = (): number => {
    return document.querySelectorAll('#scroll-it-jobs div.box-job').length;
}

const getJobs = (): CareerBuilderJob[] => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let list = document.querySelectorAll('#scroll-it-jobs div.box-job');

    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div.cont a.job-title');
        const companyEle = element.querySelector('div.logo-box img');

        const jobId = element.querySelector('span.job-favorite')?.getAttribute('data-job-id') || '';
        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = titleEle?.textContent?.trim() || '';
        const company = companyEle?.getAttribute('data-original-title') || '';
        const companyLogo = companyEle?.getAttribute('src') || '';
        const skills = Array.from(element.querySelectorAll('div.tag-list a span')).map(ele => ele.textContent?.trim() || '');
        const onlineDate = element.querySelector('p.job-ago')?.textContent?.trim() || '';
        if (jobTitle.length > 0 && jobId.length > 0) {
            jobs.push({ jobId, companyLogo, jobTitle, company, link, domain, skills, onlineDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    let jobInfoEles = Array.from(document.querySelector('#fixed_scroll')?.children || document.querySelector('#fixed_scroll1')?.children || []);
    let categories = ['IT - Phần Mềm'];
    let locations: string[] = [];
    let jobDescription: string = '';
    let jobType: string = '';
    let experience: string = '';
    let jobDetailContentEle = Array.from(document.querySelector('#slide-wrap-length div.left-cont')?.children || []);
    if (jobDetailContentEle.length == 0) {
        jobDetailContentEle = Array.from(document.querySelector('#slide-wrap-length1 div.left-cont')?.children || []);
    }
    if (jobDetailContentEle.length > 0) {
        jobDetailContentEle.shift();
        jobDetailContentEle.shift();
        jobDescription = jobDetailContentEle.reduce((value1, value2) => value1 + (value2.outerHTML || ''), '');
        jobDescription = `<div>${jobDescription}</div>`.replace(/<a /g, '<span ').replace(/a>/g, 'span>');

        for (let index = 0; index < jobInfoEles.length; index++) {
            const element = jobInfoEles[index];
            const title = (element.textContent || '').trim();
            const nextElement = jobInfoEles.length > (index + 1) ? jobInfoEles[index + 1] : null;
            if (title.includes('Year of experience')) {
                if (nextElement) {
                    experience = nextElement.textContent?.trim() || '';
                }
            } else if (title.includes('Location')) {
                if (nextElement) {
                    locations = [nextElement.textContent?.trim() || ''];
                }
            } else if (title.includes('Job Type')) {
                if (nextElement) {
                    jobType = nextElement.textContent?.trim() || '';
                }
            }
        }
        return { jobType, jobDescription, categories, experience, locations, jobLocations: locations };
    }

    return {};
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page, maxItem: number) {
    try {
        const jobs = await page.evaluate(getJobs);
        await closePage(page);
        const items: Job[] = [];
        const maxIndex = jobs.length >= maxItem ? maxItem : jobs.length;
        for (let index = 0; index < maxIndex; index++) {
            const job = jobs[index];
            const pageDetail = await browser.newPage();
            await pageDetail.goto(job.link!, { waitUntil: 'networkidle0', timeout: config.timeout });
            const jobDetail = await pageDetail.evaluate(getJobDetail);
            await closePage(pageDetail);
            const item = convertToJob({
                ...job,
                ...jobDetail,
                jobId: Prefix.topdev + job.jobId,
                onlineDate: convertTimeAgoToDate(job.onlineDate || '')
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await pageDetail.waitForTimeout(number)
            items.push(item);
        }
        Logger.info(`Load data page: ${url} count: ${items.length}`);
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
        //        throw new Error(err);
    }

}

const TopDev = {
    getJobInPage,
    getNextPage,
    getTotalItems
}

export default TopDev;