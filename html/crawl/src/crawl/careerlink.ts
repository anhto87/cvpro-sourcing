import puppeteer from 'puppeteer';
import { Prefix, URLConstants, URLCraw } from './constants/constant';
import config from '../database/config';
import { Job, saveConfig, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, createPage, delay, scrollToBottom } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        function parseLink(link: string) {
            if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
            return location.origin + link;
        }
        const pages = document.querySelectorAll('ul.pagination li');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            const nextPage = pages[activePage + 1]
            return parseLink(nextPage.querySelector('a')?.getAttribute('href') || '');
        }
        return null;
    })
    Logger.info(`Next Page ${nextPageUrl}`)
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
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: config.timeout });
        await scrollToBottom(page);
        let nextPage = await getNextPage(page) || URLCraw.careerLink;
        const jobs = await page.evaluate(getJobs);
        await closePage(page);
        const items: Job[] = [];
        for (const job of jobs) {
            const jobDetail = await scapeDetail(job.link!, browser);
            if (!jobDetail) {
                return items;
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
        await saveConfig({ name: URLConstants.careerLink, page: nextPage });
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