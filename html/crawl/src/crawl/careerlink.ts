import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import config from '../database/config';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, delay, scrollToBottom } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    const nextPageUrl = await page.evaluate(() => {
        const pages = document.querySelectorAll('ul.pagination li a');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            return parseLink(pages[activePage + 1].getAttribute('href') || '');
        }
        return null;
    })
    return nextPageUrl;
}

const getJobs = (): CareerBuilderJob[] => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let list = document.querySelectorAll('div.container ul.list-group li.job-item div.media');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('a.job-link');
        const companyEle = element.querySelector('a.job-company');
        let jobId: string = '';
        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = (titleEle?.getAttribute('title') || '').trim();
        const company = (companyEle?.getAttribute('title') || '').trim();
        const companyLogo = element.querySelector('div.job-logo img')?.getAttribute('src') || '';
        const locations = Array.from(element.querySelectorAll('div.job-location a')).map(ele => (ele.getAttribute('title') || '').trim());
        const salary: string = (element.querySelector('div span.job-salary')?.textContent || '').trim();
        const onlineDate: string = (element.querySelector('div span.job-update-time span')?.textContent || '').trim();
        const components = link.split('/');
        if (components.length > 0) {
            jobId = components[components.length - 1];
        }
        if (jobTitle.length > 0 && jobId.length > 0) {
            jobs.push({ jobId, jobTitle, company, companyLogo, link, domain, jobLocations: locations, locations, onlineDate, salary })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    let benefits: String[] = [];
    let categories: string[] = Array.from(document.querySelectorAll('#section-job-description div.job-summary div.job-summary-item span[itemprop="occupationalCategory"]')).map(ele => ele.textContent?.trim() || '');
    let experience: string = (document.querySelector('#section-job-description div.job-summary div.job-summary-item div[itemprop="experienceRequirements"]')?.textContent || '').trim();
    let jobType: string = (document.querySelector('#section-job-description div.job-summary div.job-summary-item div[itemprop="employmentType"]')?.textContent || '').trim();
    let expiredDate: string = (document.querySelector('div.job-expire span[itemprop="validThrough"]')?.textContent || '').trim();
    let publishedDate: string = (document.querySelector('div.job-expire span[itemprop="datePosted"]')?.textContent || '').trim();
    let jobDescription: string = '';

    let jobDetailContentEles = Array.from(document.querySelectorAll('#section-job-description div'));
    if (jobDetailContentEles.length > 0) {
        for (let index = 0; index < jobDetailContentEles.length; index++) {
            const element = jobDetailContentEles[index];
            const title = element.querySelector('h5')?.textContent?.trim() || '';
            if (title.includes("Mô tả công việc") || title.includes("Kỹ năng chi tiết")) {
                jobDescription += element.outerHTML;
                continue;
            }
        }
        jobDescription = `<div>${jobDescription}</div>`;
        return { jobType, jobDescription, categories, experience, benefits, expiredDate, publishedDate };

    }

    return {};
}

async function scapeDetail(link: string, browser: puppeteer.Browser) {
    const pageDetail = await browser.newPage();
    try {
        await pageDetail.goto(link, { waitUntil: 'networkidle0', timeout: config.timeout });
        const jobDetail = await pageDetail.evaluate(getJobDetail);
        await closePage(pageDetail);
        return jobDetail
    } catch (error) {
        Logger.error(`link: ${error}`)
        await pageDetail.close();
        return null
    }
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page) {
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
        await scrollToBottom(page);
        const jobs = await page.evaluate(getJobs);
        await closePage(page);
        const items: Job[] = [];
        for (const job of jobs) {
            const jobDetail = await scapeDetail(job.link!, browser);
            if (!jobDetail) {
                continue
            }
            const item = convertToJob({
                ...job,
                ...jobDetail,
                jobId: Prefix.careerLink + job.jobId,
                onlineDate: convertTimeAgoToDate(job.onlineDate || '')
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number)
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

const CareerLink = {
    getJobInPage,
    getNextPage
}

export default CareerLink;