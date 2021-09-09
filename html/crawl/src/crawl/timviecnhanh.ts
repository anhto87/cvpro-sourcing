import puppeteer from 'puppeteer';
import { Prefix, URLConstants, URLCraw } from './constants/constant';
import config from '../database/config';
import { Job, saveConfig, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertToJob, createPage, delay, scrollToBottom } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        const pages = document.querySelectorAll('div.page-navi a[role="presentation"]');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            let pageNumber = parseInt(pages[activePage + 1].textContent || '');
            return `https://timviecnhanh.com/vieclam/timkiem?page=${pageNumber}`;
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

    let list = document.querySelector('table.list-job-hot tBody')?.querySelectorAll('tr') || [];

    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const jobInfoEles = element.querySelectorAll('td');
        const titleEle = jobInfoEles.length > 0 ? jobInfoEles[0].querySelector('a.title-job') : null;
        const locationEles = Array.from(jobInfoEles.length > 1 ? jobInfoEles[1].querySelectorAll('div') : []);

        const link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = titleEle?.getAttribute('title') || '';
        const company = jobInfoEles.length > 0 ? (jobInfoEles[0].querySelector('a.company-job')?.getAttribute('title') || '') : '';
        const expiredDate = jobInfoEles.length > 3 ? jobInfoEles[3].querySelector('div')?.textContent?.trim() : '';
        const salary = jobInfoEles.length > 2 ? jobInfoEles[2].querySelector('div')?.textContent?.trim() : '';
        let jobId = '';

        let components = link.split('.html');
        if (components.length > 0) {
            let componts = components[0].split('-');
            jobId = componts.length > 0 ? componts[componts.length - 1] : '';
        }

        if (jobTitle.length > 0 && jobId.length > 0) {
            let locations: string[] = [];
            for (const loca of locationEles) {
                let spanEl = loca.querySelector('span')?.getAttribute('title');
                if (spanEl) {
                    locations = spanEl.split(' ');
                } else {
                    locations.push(loca.textContent || '')
                }
            }
            jobs.push({ jobId, jobTitle, salary, company, link, domain, jobLocations: locations, locations, expiredDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    let updateComponents = document.querySelector('span.total-views-counter')?.parentElement?.textContent?.replace('Cập nhật: ', '').split('|') ?? [];
    let jobInfoEles = document.querySelectorAll('article div.row div.col-md-6 ul li');

    let benefits: String[] = [];
    let categories: string[] = [];
    let companyLogo: string = document.querySelector('div.block-sidebar div.text-center img')?.getAttribute('src') || '';
    let jobLocations: string[] = [];
    let jobDescription: string = '';
    let onlineDate: string = (updateComponents.length > 0 ? updateComponents[0] : '').trim();
    let experience: string = '';
    let skills: string[] = [];
    let jobType: string = '';

    let jobDetailContentEle = document.querySelectorAll('article table.word-break tBody tr');
    if (jobDetailContentEle.length > 0) {

        for (let index = 0; index < jobDetailContentEle.length; index++) {
            const element = jobDetailContentEle[index];
            const nextIndex = index + 1;
            switch (element.querySelector('b')?.textContent) {
                case "Mô tả":
                case "Yêu cầu":
                case "Quyền lợi":
                    jobDescription += element.outerHTML
                    break;
                default:
                    break;
            }
        }
        jobDescription = `<table><tbody>${jobDescription}</tbody></table>`;

        for (let index = 0; index < jobInfoEles.length; index++) {
            const element = jobInfoEles[index];
            const title = element.querySelector('b')?.textContent || '';
            const value = (element.textContent || '').replace(title, '');
            if (title.includes('Kinh nghiệm')) {
                experience = value;
            } else if (title.includes('Trình độ')) {
                skills = value.split(',');
            } else if (title.includes('Ngành nghề')) {
                categories = Array.from(element.querySelectorAll('a')).map(ele => (ele.textContent || '').trim());
            } else if (title.includes('Hình thức làm việc')) {
                jobType = value;
            } else if (title.includes('Tỉnh/Thành phố')) {
                jobLocations = Array.from(element.querySelectorAll('a')).map(ele => (ele.textContent || '').trim());
            }
        }

        return { jobType, jobDescription, categories, experience, skills, benefits, jobLocations, onlineDate, companyLogo };

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
        Logger.error(`link: ${error}`)
        await pageDetail?.close()
        pageDetail = null;
        return null
    }
}

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page) {
    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: config.timeout });
        await scrollToBottom(page);
        let nextPage = await getNextPage(page) || URLCraw.timViecNhanh;
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
                jobId: Prefix.timViecNhanh + job.jobId
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number)
            items.push(item);
        }
        await saveConfig({ name: URLConstants.timViecNhanh, page: nextPage });
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
        //        throw new Error(err);
    }

}

const TimViecNhanh = {
    getJobInPage,
    getNextPage
}

export default TimViecNhanh;