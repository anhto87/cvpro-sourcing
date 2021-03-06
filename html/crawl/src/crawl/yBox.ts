import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, createPage, createPuppeteerBrowser, delay, scrollToBottom, setHeader } from './helper';
import config from '../database/config';


const getNextPage = async (page: puppeteer.Page) => null;

const getTotalItems = (): number => {
    return document.querySelectorAll('div.mt-20 div.post.post--article div.panel-body').length;
}

const getJobs = (): CareerBuilderJob[] => {
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let list = document.querySelectorAll('div.mt-20 div.post.post--article div.panel-body');

    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('h2.post-title a');

        const domain: string = document.domain;
        const link: string = parseLink(titleEle?.getAttribute('href') || '');
        const jobId: string = link.split("-").length > 0 ? link.split("-")[link.split("-").length - 1] : '';
        const jobTitle: string = titleEle?.textContent?.trim() || '';
        const companyLogo: string = (element.querySelector('div.photo')?.getAttribute('style') || '').split('"')[1];
        const onlineDate: string = element.querySelector('div.publisher__name h6 span')?.textContent?.trim() || '';
        const expiredDate: string = element.querySelector('div.publisher__name span.due-date')?.textContent?.trim() || '';
        if (jobTitle.length > 0 && jobId.length > 0) {
            jobs.push({ jobId, companyLogo, company: jobTitle, jobTitle, link, domain, onlineDate, expiredDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob[] => {
    let jobDetailContentEle = Array.from(document.querySelector('#post-content.content-group-lg')?.children || []);
    if (jobDetailContentEle.length > 0) {

        let locations: string[] = [];
        let jobDescription: string = '';
        let jobType: string = '';
        let experience: string = '';
        let salary: string = '';

        for (const element of jobDetailContentEle) {
            let key = element.querySelector('b')?.textContent || '';
            if (key.includes('Ti??u ????? email ghi r??') || key.includes("H??nh th???c ???ng tuy???n")) {

            } else {
                jobDescription += element.outerHTML;
            }
        }
        jobDescription = `<div>${jobDescription}</div>`.replace(/<a /g, '<span ').replace(/a>/g, 'span>');

        salary = Array.from(document.querySelector('div span img[alt="M???c l????ng"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
        locations = Array.from(document.querySelector('div span img[alt="?????a ??i???m"]')?.parentElement?.querySelectorAll('span') || []).map(ele => ele.textContent?.trim() || '');
        jobType = Array.from(document.querySelector('div span img[alt="T??nh ch???t c??ng vi???c"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
        experience = Array.from(document.querySelector('div span img[alt="Kinh nghi???m"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
        return [{ jobType, jobDescription, experience, locations, jobLocations: locations, salary }];
    }

    jobDetailContentEle = Array.from(document.querySelector('#post-content')?.children || []);
    jobDetailContentEle.shift();
    if (jobDetailContentEle.length > 0) {
        const jobs: CareerBuilderJob[] = [];
        for (const element of jobDetailContentEle) {
            const jobId = element.querySelector('div span.text-title-post')?.getAttribute('data-reactid') || '';
            const jobTitle = element.querySelector('div span.text-title-post')?.textContent?.trim() || '';
            let jobDescription = Array.from(element.querySelectorAll('div.mb-30')).reduce((value1, value2) => value1 + value2.outerHTML?.trim() || '', '');
            jobDescription = `<div>${jobDescription}</div>`.replace(/<a /g, '<span ').replace(/a>/g, 'span>');

            let salary = Array.from(document.querySelector('div span img[alt="M???c l????ng"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
            let locations = Array.from(document.querySelector('div span img[alt="?????a ??i???m"]')?.parentElement?.querySelectorAll('span') || []).map(ele => ele.textContent?.trim() || '');
            let jobType = Array.from(document.querySelector('div span img[alt="T??nh ch???t c??ng vi???c"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
            let experience = Array.from(document.querySelector('div span img[alt="Kinh nghi???m"]')?.parentElement?.querySelectorAll('span') || []).reduce((value1, value2) => value1 + (value2.textContent || ''), '').trim();
            jobs.push({ jobId, jobTitle, jobDescription, salary, locations, jobLocations: locations, jobType, experience });
        }
        return jobs;
    }
    return [];
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page, maxItem: number) {
    try {
        const jobs = await page.evaluate(getJobs);
        await closePage(page);
        await browser.close();
        Logger.info(`url: ${url} start scrape ${jobs.length}`)
        const items: Job[] = [];
        const maxJobs = jobs.length >= maxItem ? maxItem : jobs.length;
        for (let index = 0; index < maxJobs; index++) {
            const job = jobs[index];
            Logger.info("Ybox create new Browser")
            let newBrowser = await createPuppeteerBrowser();
            const pageDetail = await createPage(newBrowser);
            if (!pageDetail) {
                await newBrowser.close();
                continue
            }
            await pageDetail.goto(job.link!, { waitUntil: 'networkidle0', timeout: config.timeout });
            const jobDetails = await pageDetail.evaluate(getJobDetail);
            await closePage(pageDetail)
            Logger.info("Ybox comming close new Browser")
            await newBrowser.close();
            Logger.info("Ybox closed new Browser")
            for (const jobDetail of jobDetails) {
                const onlineDate = convertTimeAgoToDate(job.onlineDate || '');
                const item = convertToJob({
                    ...job,
                    ...jobDetail,
                    jobId: jobDetail.jobId ? `${Prefix.xBox + job.jobId}_${jobDetail.jobId}` : `${Prefix.xBox + job.jobId}`,
                    onlineDate
                });
                await saveJob(item);
                items.push(item);
            }
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number)
        }
        Logger.info(`Load data page: ${url} count: ${items.length}`);
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
    }

}

const yBox = {
    getJobInPage,
    getNextPage,
    getTotalItems
}

export default yBox;