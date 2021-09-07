import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import config from '../database/config';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertTimeAgoToDate, convertToJob, delay, scrollToBottom } from './helper';


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
            let link = pages[activePage + 1].querySelector('a')?.getAttribute('href');
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
    let list = document.querySelectorAll('div.job-list.search-result div.job-ta');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div h4.job-title a');
        const companyEle = element.querySelector('div a.company-logo img');
        const locationEle = Array.from(element.querySelectorAll('#row-result-info-job div'));

        const jobId = element.getAttribute('data-job-id') || '';
        if (jobId.length > 0) {

            const jobTitle = titleEle?.textContent?.trim() || '';
            const link = titleEle?.getAttribute('href') || '';
            const domain = document.domain;
            const companyLogo = parseLink(companyEle?.getAttribute('src') || '');
            const company = companyEle?.getAttribute('alt') || '';

            let locations: string[] = [];
            const location = element.querySelector('span.address')?.textContent?.trim() || '';
            const onlineDate = element.querySelector('div.updated_at')?.textContent?.trim() || '';
            if (location) {
                locations = location.replace('Khu vực:', '').replace('...', '').split(',');
            }
            jobs.push({ jobId, jobTitle, companyLogo, company, link, domain, jobLocations: locations, locations, onlineDate })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    enum Constant {
        expiredDate = 'Hết hạn nộp',
        catagories = 'Ngành nghề',
        jobType = 'Hình thức làm việc',
        salaly = 'Lương',
        experience = 'Yêu cầu kinh nghiệm',
        jobLocations = 'Địa điểm làm việc',
        skills = "Yêu cầu về bằng cấp",
        benefits = "Quyền lợi được hưởng",
        jobDescription = "Mô tả công việc",
        jobRequirement = "Yêu cầu ứng viên",
    }
    const getInfoValue = (key: string, queryElement: string, queryValue: string, array: Element[]) => {
        const index = array.findIndex(ele => ele.querySelector(queryElement)?.textContent?.includes(key) || false);
        if (index > -1) {
            if (key === Constant.jobLocations) {
                return Array.from(array[index].querySelectorAll('a')).map(ele => (ele.textContent || '').trim())
            }
            return array[index].querySelector(queryValue)?.textContent || '';
        }
        return '';
    }

    let jobDetailContentEle = Array.from(document.querySelector('#col-job-left')?.children || []);
    if (jobDetailContentEle.length > 0) {
        let benefits: String[] = [];
        let categories: string[] = [];
        let skills: string[] = [];
        let jobDescription: string = '';
        for (let index = 0; index < jobDetailContentEle.length; index++) {
            const element = jobDetailContentEle[index];
            const nextIndex = index + 1;
            switch (element.textContent) {
                case Constant.jobDescription:
                case Constant.jobRequirement:
                case Constant.benefits:
                    if (Constant.benefits === element.textContent) {
                        benefits = Array.from(jobDetailContentEle[nextIndex].querySelectorAll('p')).map(ele => ele.textContent?.trim() || '').filter(ele => ele.length > 0);
                    }
                    if (jobDetailContentEle.length > nextIndex) {
                        const txtContent = (element.outerHTML || '') + (jobDetailContentEle[nextIndex].outerHTML || '');
                        jobDescription += txtContent
                    }
                    break;
                default:
                    let textContent = element.querySelector('h4')?.textContent
                    if (textContent?.includes(Constant.catagories)) {
                        categories = Array.from(element.querySelectorAll('a')).map(ele => ele.textContent?.trim() || '');
                    }

                    if (textContent?.includes('Kỹ năng')) {
                        skills = Array.from(element.querySelectorAll('a')).map(ele => ele.textContent?.trim() || '');
                    }
                    break;
            }
        }
        jobDescription = `<div>${jobDescription}</div>`
        const jobInfoEles = Array.from(document.querySelectorAll('#col-job-right #box-info-job div.job-info-item'));
        const jobLocations: string[] = getInfoValue(Constant.jobLocations, 'strong', 'span', jobInfoEles) as string[];
        const jobType: string = getInfoValue(Constant.jobType, 'strong', 'span', jobInfoEles) as string;
        const experience: string = getInfoValue(Constant.experience, 'strong', 'span', jobInfoEles) as string;
        const expiredDate: string = (document.querySelector('#row-job-title div.job-deadline')?.textContent || '').replace('Hạn nộp hồ sơ:', '').trim();
        return { jobType, jobDescription, categories, experience, benefits, jobLocations, expiredDate, skills };
    }

    const jobDescription = document.querySelector('div.job-data')?.outerHTML || '';
    jobDetailContentEle = Array.from(document.querySelector('div.job-data')?.children || [])
    if (jobDescription.length > 0) {
        const expiredDate = document.querySelector('span[data-original-title="Hạn ứng tuyển"]')?.textContent?.trim() || '';
        const jobType = document.querySelector('span[data-original-title="Hình thức làm việc"]')?.textContent?.trim() || '';
        const experience = document.querySelector('span[data-original-title="Yêu cầu kinh nghiệm"]')?.textContent?.trim() || '';
        const jobLocations: string[] = [document.querySelector('span[data-original-title="Địa chỉ làm việc"]')?.textContent?.trim() || ''];
        let categories: string[] = [];
        let skills: string[] = [];
        let benefits: String[] = [];

        const jobDetailEles = Array.from(document.querySelector('div.job-data')?.parentElement?.querySelectorAll('h4') || []);
        const categoryContents = jobDetailEles.filter(ele => ele.textContent?.trim().includes('Ngành nghề'));
        if (categoryContents.length > 0) {
            categories = Array.from(categoryContents[0].parentElement?.querySelectorAll('span a') || []).map(ele => ele.textContent?.trim() || '')
        }
        const skillContents = jobDetailEles.filter(ele => ele.textContent?.trim().includes('Kỹ năng'));
        if (skillContents.length > 0) {
            skills = Array.from(skillContents[0].parentElement?.querySelectorAll('span a') || []).map(ele => ele.textContent?.trim() || '')
        }

        let index = jobDetailContentEle.findIndex(ele => ele.textContent?.includes("QUYỀN LỢI ĐƯỢC HƯỞNG"))
        if (index && jobDetailContentEle.length > (index + 1)) {
            benefits = Array.from(jobDetailContentEle[index + 1].querySelectorAll('p')).map(ele => ele.textContent?.trim() || '').filter(ele => ele.length > 0);
        }

        return { jobType, jobDescription, categories, experience, skills, benefits, jobLocations, expiredDate };
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
                jobId: Prefix.topcv + job.jobId,
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

const TopCv = {
    getJobInPage,
    getNextPage
}

export default TopCv;