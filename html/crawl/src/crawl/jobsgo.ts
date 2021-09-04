import puppeteer from 'puppeteer';
import { Prefix } from './constants/constant';
import config from '../database/config';
import { Job, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertToJob, scrollToBottom } from './helper';

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
    let list = document.querySelectorAll('div.item-click article.article div.item-fl-box');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div.brows-job-position div.h3 a');
        const companyEle = element.querySelector('div.brows-job-company-img a img');
        const locationEle = Array.from(element.querySelectorAll('div.brows-job-position p span'));

        if (titleEle && companyEle) {
            const jobTitle = titleEle.getAttribute('title') || '';
            const link = titleEle.getAttribute('href') || '';
            const domain = document.domain;
            const companyLogo = parseLink(companyEle?.getAttribute('src') || '');
            const company = companyEle?.getAttribute('alt') || '';
            const components = link.replace('.html', '').split('-');
            const jobId = components.length > 0 ? components[components.length - 1] : '';
            let locations: string[] = [];
            const location = locationEle.length > 0 ? locationEle[0].getAttribute('title') : null;
            const expiredDate = locationEle.length > 1 ? locationEle[1].textContent?.trim() : '';
            const salary = locationEle.length > 2 ? locationEle[2].textContent?.trim() : '';
            if (location) {
                locations = location.replace('...', '').split(',');
            }
            if (jobId.length > 0) {
                jobs.push({ jobId, jobTitle, companyLogo, company, link, domain, jobLocations: locations, locations, expiredDate, salary })
            }
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    enum Constant {
        onlineDate = 'Ngày cập nhật',
        expiredDate = 'Hết hạn nộp',
        catagories = 'Ngành nghề',
        jobType = 'Tính chất công việc',
        experience = 'Yêu cầu kinh nghiệm',
        jobLocations = 'Địa điểm làm việc',
        skills = "Yêu cầu về bằng cấp",
        benefits = "Quyền lợi được hưởng"

    }

    let jobDetailContentEle = document.querySelectorAll('div.panel div.panel-body div.content-group');
    if (jobDetailContentEle.length > 3) {
        const jobDescription = `<div>${jobDetailContentEle[1].outerHTML}${jobDetailContentEle[2].outerHTML}${jobDetailContentEle[3].outerHTML}</div>`;

        let jobLocations: string[] = [];
        let categories: string[] = [];
        let jobType: string = '';
        let experience: string = '';
        let skills: string[] = [];
        let benefits: String[] = [];
        const jobInfoELes = document.querySelector('div.panel div.panel-body div.content-group div.box-jobs-info')?.children || [];
        for (let index = 0; index < jobInfoELes.length; index++) {
            const jobInfoELe = jobInfoELes[index];
            const nextIndex = index + 1;
            switch (jobInfoELe.textContent) {
                case Constant.jobLocations:
                    if (jobInfoELes.length > nextIndex) {
                        const location = jobInfoELes[nextIndex].textContent || null;
                        if (location) { jobLocations.push(location) }
                    }
                    break;
                case Constant.catagories:
                    if (jobInfoELes.length > nextIndex) {
                        categories = Array.from(jobInfoELes[nextIndex].querySelectorAll('a')).map(ele => ele.textContent || '');
                    }
                    break;
                case Constant.jobType:
                    if (jobInfoELes.length > nextIndex) {
                        jobType = Array.from(jobInfoELes[nextIndex].querySelectorAll('a')).map(ele => ele.textContent || '').join(',');
                    }
                    break;
                case Constant.experience:
                    if (jobInfoELes.length > nextIndex) {
                        experience = jobInfoELes[nextIndex].textContent || '';
                    }
                    break;
                default:
                    if (jobInfoELe.textContent?.includes(Constant.skills)) {
                        if (jobInfoELes.length > nextIndex) {
                            const location = jobInfoELes[nextIndex].textContent || null;
                            if (location) { skills.push(location) }
                        }
                    }
                    break;
            }

        }

        let benefitsELes = jobDetailContentEle.length > 3 ? jobDetailContentEle[3] : null;
        if (benefitsELes && benefitsELes.querySelector('h5')?.textContent === Constant.benefits) {
            benefits = Array.from(benefitsELes.querySelectorAll('p')).map(ele => ele.textContent || '')
        }
        return { jobType, jobDescription, categories, experience, skills, benefits, jobLocations };

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
            Logger.info('Jobgo is new Page')
            await pageDetail.goto(job.link!, { waitUntil: 'networkidle0', timeout: config.timeout });
            const jobDetail = await pageDetail.evaluate(getJobDetail);
            await closePage(pageDetail);
            Logger.info('Jobgo is new Page closed')
            const item = convertToJob({ ...job, ...jobDetail, jobId: Prefix.jobsGo + job.jobId });
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

const JobsGo = {
    getJobInPage,
    getNextPage
}

export default JobsGo;