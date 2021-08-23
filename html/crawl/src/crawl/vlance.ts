import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { convertTimeAgoToDate, convertToJob, scrollToBottom } from './helper';
import md5 from 'md5';
import config from '../database/config';

const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        function parseLink(link: string) {
            if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
            return location.origin + link;
        }
        const pages = Array.from(document.querySelector('p.results-paging')?.children || []);
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('current');
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
//ankiinn1@gmail.com
//pG9pp@DrcGx8B.z

const getJobs = (): CareerBuilderJob[] => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let list = document.querySelectorAll('div[class="row-fluid row-result "] div.fr-info');

    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('.block-title a');

        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = titleEle?.textContent?.trim() || '';
        const company = element.querySelector('div.fr-title a')?.getAttribute('title') || '';
        const locations: string[] = []
        const categories: string[] = ['Freelance'];
        let skills: string[] = [];

        const skillEles = Array.from(element.querySelectorAll('div.skill-list span a'));
        skillEles.shift();
        skills = skillEles.map(ele => ele.textContent?.trim() || '');

        const category = element.querySelector('div.history span.category')?.textContent?.trim() || '';
        if (category.length > 0) {
            categories.push(category)
        }

        const location = element.querySelector('div.history span.location')?.textContent?.trim() || '';
        if (location.length > 0) {
            locations.push(location)
        }
        const expiredDate = element.querySelector('div.remain-job div.remain')?.textContent?.trim().replace('Hạn nhận hồ sơ: ', '') || '';
        const salary: string = element.querySelector('div.history span.history-job')?.textContent?.trim() || '';

        if (jobTitle.length > 0 && expiredDate?.length > 0) {
            jobs.push({ jobTitle, salary, company, link, domain, jobLocations: locations, locations, expiredDate, categories, skills })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let jobInfoEles = Array.from(document.querySelector('div.description-job .dl-horizontal')?.children || []);
    let companyEle = document.querySelector('div.info-employment a')

    let companyLogo: string = parseLink(companyEle?.querySelector('img')?.getAttribute('src') || '');
    let company: string = companyEle?.getAttribute('title') || '';
    let jobDescription: string = document.querySelector('div.description')?.outerHTML || '';
    let jobType: string = '';
    let publishedDate: string = '';
    let jobId: string = '';

    for (let index = 0; index < jobInfoEles.length; index++) {
        const element = jobInfoEles[index];
        let title = element.textContent?.trim() || '';
        let nextElement = jobInfoEles.length > (index + 1) ? jobInfoEles[index + 1] : null;
        if (title.includes('ID dự án')) {
            jobId = nextElement?.textContent?.trim() || '';
        } else if (title.includes('Ngày đăng')) {
            let components = (nextElement?.textContent?.trim() || '').split(',');
            publishedDate = components.length > 0 ? components[0] : "";
        } else if (title.includes('Hình thức làm việc')) {
            jobType = nextElement?.textContent?.trim() || '';
        }
    }

    return { companyLogo, company, jobDescription, jobType, publishedDate, jobId };
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page) {
    try {
        const cookies = [{
            'name': 'PHPSESSID',
            'value': 'smaeuiu6e9n01e2otcr43vah00',
            'url': 'https://www.vlance.vn',
            'domain': 'www.vlance.vn'
        }]
        await page.setCookie(...cookies);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
        await scrollToBottom(page);
        const jobs = await page.evaluate(getJobs);
        const items: Job[] = [];
        for (const job of jobs) {
            const pageDetail = await browser.newPage();
            await pageDetail.goto(job.link!, { waitUntil: 'networkidle0', timeout: 0 });
            const jobDetail = await pageDetail.evaluate(getJobDetail);
            await pageDetail.close();
            const item = convertToJob({
                ...job,
                ...jobDetail,
                jobId: Prefix.vlance + jobDetail.jobId ? jobDetail.jobId : md5(job.link || ''),
                expiredDate: convertTimeAgoToDate(job.expiredDate || '')
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

const vlance = {
    getJobInPage,
    getNextPage
}

export default vlance;