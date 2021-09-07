import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import config from '../database/config';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertToJob, delay, scrollToBottom } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        function parseLink(link: string) {
            if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
            return location.origin + link;
        }
        const pages = document.querySelectorAll('ul.pagination li a');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            let link = pages[activePage + 1].getAttribute('href');
            if (link) {
                return parseLink(link);
            }
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
    let list = document.querySelectorAll('div.result-box div.normal-job div.job-info');

    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('h3.job-name a');
        const jobInfoEles = element.querySelectorAll('div');
        const locationsEles = jobInfoEles.length > 2 ? jobInfoEles[2].querySelectorAll('span'):[];

        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = titleEle?.getAttribute('title') || '';
        const company = element.querySelector('a.com-name')?.getAttribute('title') || '';
        const locations: string[] = locationsEles.length > 0 ? (locationsEles[locationsEles.length - 1].getAttribute('title')?.split(',') || []).map(ele => ele.trim()):[];
        const expiredDate = jobInfoEles.length > 3 ? (jobInfoEles[3].textContent?.trim() || '') : '';
        const salary = jobInfoEles.length > 1 ? (jobInfoEles[1].textContent?.trim() || '') : '';
        let jobId = '';

        let components = link.split('.html');
        if (components.length > 0) {
            let componts = components[0].split('-');
            jobId = componts.length > 0 ? componts[componts.length - 1] : '';
        }

        if (jobTitle.length > 0 && jobId.length > 0) {
            jobs.push({ jobId, jobTitle, salary, company, link, domain, jobLocations: locations, locations, expiredDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    let jobInfoEles = document.querySelectorAll('#style-ipad ul li');

    let categories: string[] = [];
    let companyLogo: string = document.querySelector('div.img-ads img')?.getAttribute('src') || '';
    let jobDescription: string = '';
    let jobType: string = '';
    let experience: string = '';

    let jobDetailContentEle = document.querySelectorAll('div.list-thong-tin div');
    if (jobDetailContentEle.length > 0) {

        for (let index = 0; index < jobDetailContentEle.length; index++) {
            const element = jobDetailContentEle[index];
            const nextElement = (index + 1) < jobDetailContentEle.length ? jobDetailContentEle[index + 1]:null;
            switch (element?.textContent) {
                case "Mô tả công việc":
                case "Yêu cầu công việc":
                case "Quyền lợi  được hưởng":
                    jobDescription += element.outerHTML;
                    if (nextElement) {
                        jobDescription += nextElement.outerHTML;
                    }
                    break;
                default:
                    break;
            }
        }
        jobDescription = `<div>${jobDescription}</div>`.replace(/<a /g, '<span ').replace(/a>/g, 'span>');

        for (let index = 0; index < jobInfoEles.length; index++) {
            const element = jobInfoEles[index];
            const title = (element.textContent || '').trim();
            if (title.includes('Kinh nghiệm: ')) {
                experience = title.replace('Kinh nghiệm: ', '').trim();
            } else if (title.includes('Ngành nghề')) {
                categories = Array.from(element.querySelectorAll('a')).map(ele => ele.getAttribute('title') || '');
            } else if (title.includes('Hình thức làm việc')) {
                jobType = title.replace('Hình thức làm việc:', '').trim();
            }
        }

        return { jobType, jobDescription, categories, experience, companyLogo };

    }

    return {};
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page) {
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
        await scrollToBottom(page);
        const jobs = await page.evaluate(getJobs);
        await closePage(page);
        const items: Job[] = [];
        for (const job of jobs) {
            const pageDetail = await browser.newPage();
            await pageDetail.goto(job.link!, { waitUntil: 'networkidle0', timeout: config.timeout });
            const jobDetail = await pageDetail.evaluate(getJobDetail);
            await closePage(pageDetail);
            const item = convertToJob({
                ...job,
                ...jobDetail,
                jobId: Prefix.viecTotNhat + job.jobId
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number);
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

const ViecTotNhat = {
    getJobInPage,
    getNextPage
}

export default ViecTotNhat;