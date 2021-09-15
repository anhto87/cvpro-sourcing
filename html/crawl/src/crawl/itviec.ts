import md5 from 'md5';
import puppeteer from 'puppeteer';
import { Prefix, URLConstants, URLCraw } from './constants/constant';
import config from '../database/config';
import { Job, saveConfig, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, createPage, delay, screenShotLog, scrollToBottom, setHeader } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        const pages = document.querySelectorAll('ul.pagination li');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            let link = pages[activePage + 1].querySelector('a')?.getAttribute('href');
            if (link) {
                return location.origin + link;
            }
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
    let list = document.querySelectorAll('#jobs div.job');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div.job_content div.details .title a');
        const jobTitle = titleEle?.textContent?.trim() || '';
        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        if (jobTitle.length > 0) {

            const locations = (element.querySelector('div.city div.address span')?.textContent || '').replace('...', '').split(',');
            const onlineDate = (element.querySelector('div.distance-time-job-posted')?.textContent || '').replace(/\n/gi, '');
            jobs.push({ jobTitle, link, domain, jobLocations: locations, locations, onlineDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    let benefits: String[] = [];
    let categories = ['IT - Phần Mềm'];
    let jobDescription: string = '';
    let companyLogo = document.querySelector('.employer-long-overview__logo img.lazyload')?.getAttribute('data-src') || '';
    let company = document.querySelector('.employer-long-overview__name a')?.textContent || '';
    let skills: string[] = Array.from(document.querySelectorAll('div.job-details__tag-list a span')).map(ele => (ele.textContent || '').replace(/\n/gi, ''));
    let jobLocations: string[] = [document.querySelector('div.job-details__overview div.svg-icon__text span')?.textContent || ''];

    let jobDetailContentEles = Array.from(document.querySelector('div.job-details')?.children || [])
    if (jobDetailContentEles.length > 0) {
        for (let index = 0; index < jobDetailContentEles.length; index++) {
            const element = jobDetailContentEles[index];
            switch (element.className) {
                case "job-details__header":
                case "job-details__overview":
                case "job-details__divider":
                case "job-details__top-reason-to-join-us":
                    continue;
                case "job-details__second-title":
                    if (element.textContent === "Top 3 Reasons To Join Us") {
                        continue
                    }
                    jobDescription += element.outerHTML;
                    break;
                default:
                    if (element.className === "job-details__paragraph") {
                        let eles = Array.from(element.children || []);
                        for (let index = 0; index < eles.length; index++) {
                            const ele = eles[index];
                            const nextIndex = index + 1;
                            if (ele.querySelector('strong')?.textContent === "Our benefits:") {
                                benefits = Array.from(eles[nextIndex].querySelectorAll('li')).map(ele => ele.textContent || '')
                            }
                        }
                    }
                    jobDescription += element.outerHTML;
                    break;
            }
        }
        jobDescription = `<div className="job-details">${jobDescription}</div>`;
        return { jobDescription, categories, skills, benefits, jobLocations, companyLogo, company };

    }

    return {};
}

async function scapeDetail(link: string, browser: puppeteer.Browser) {
    let pageDetail = await createPage(browser);
    try {
        if (!pageDetail) {
            return null
        }
        await pageDetail.goto(link, { waitUntil: 'domcontentloaded', timeout: config.timeout });
        await pageDetail.waitForSelector('.job-details__title', {
            visible: true
        })
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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeout });
        await page.waitForSelector('#jobs', {
            visible: true,
        });
        await scrollToBottom(page);
        const jobs = await page.evaluate(getJobs);
        let nextPage = await getNextPage(page) || URLCraw.itviec;
        if (jobs.length === 0) {
            await screenShotLog(page, URLConstants.itviec);
        }
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
                jobId: Prefix.itviec + md5(job.link || ''),
                onlineDate: convertTimeAgoToDate(job.onlineDate || '')
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number)
            items.push(item);
        }
        await saveConfig({ name: URLConstants.itviec, page: nextPage });
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
        //        throw new Error(err);
    }

}

const ITViec = {
    getJobInPage,
    getNextPage
}

export default ITViec;