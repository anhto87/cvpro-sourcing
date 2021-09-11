import puppeteer from 'puppeteer';
import { Prefix, URLConstants, URLCraw } from './constants/constant';
import config from '../database/config';
import { Job, saveConfig, saveJob } from '../database/entities';
import Logger from './Log';
import { CareerBuilderJob } from './careerbuilder';
import { closePage, convertToJob, createPage, delay, scrollToBottom } from './helper';


const getNextPage = async (page: puppeteer.Page) => {
    const nextPageUrl = await page.evaluate(() => {
        const pages = document.querySelectorAll('ul.pagination li span');
        const activePage = Array.from(pages).findIndex(ele => {
            return ele.className.includes('active');
        })
        if (activePage != -1 && pages.length > (activePage + 1)) {
            let pageNumber = parseInt(pages[activePage + 1].textContent || '');
            if (pageNumber) {
                return `https://vieclam24h.vn/tim-kiem-viec-lam-nhanh?page=${pageNumber}`;
            }
        }
        return null;
    })
    Logger.info(`Next Page ${nextPageUrl}`)
    return nextPageUrl;
}

const getJobs = (): CareerBuilderJob[] => {
    enum Constant {
        salary = "Mức lương",
        expiredDate = "Hạn nộp hồ sơ"
    }
    function parseLink(link: string) {
        if (link.includes('http')) { return link } else if (link.length == 0) { return '' }
        return location.origin + link;
    }
    let list = document.querySelectorAll('div.box-list-job ul li div.job-box');
    const jobs: CareerBuilderJob[] = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const titleEle = element.querySelector('div.job-row div.job-ttl a');
        const companyEle = element.querySelector('div.job-row div.candi-name a');
        const jobDetailEles = Array.from(element.querySelectorAll('div.job-row div.job-action-col div.job-desc'));

        let link = parseLink(titleEle?.getAttribute('href') || '');
        const domain = document.domain;
        const jobTitle = titleEle?.textContent || '';
        let jobId: string = '';
        const components = link.split('id');
        if (components.length > 0) {
            let arr = components[components.length - 1].split('.html');
            jobId = arr.length > 0 ? arr[0] : '';
        }

        if (jobTitle.length > 0 && jobId.length > 0) {

            const company = companyEle?.getAttribute('title') || '';
            let salary: string = '';
            let expiredDate: string = '';
            let locations: string[] = [];
            for (const element of jobDetailEles) {
                let elementTitle = element.getAttribute('title') || '';
                switch (elementTitle) {
                    case Constant.salary:
                        salary = element.querySelector('span')?.textContent || '';
                        continue;
                    case Constant.expiredDate:
                        expiredDate = element.querySelector('span')?.textContent || '';
                        continue;
                    default:
                        break;
                }
            }
            const location = jobDetailEles.length > 1 ? jobDetailEles[1].textContent?.trim() : '';
            if (location) {
                locations = location.replace('...', '').split(',').map(ele => ele.trim());
            }
            jobs.push({ jobId, jobTitle, company, link, domain, jobLocations: locations, locations, expiredDate, salary })
        } else {
            continue
        }
    }
    return jobs;
}

const getJobDetail = (): CareerBuilderJob => {
    enum Constant {
        jobType = 'Hình thức làm việc:',
        jobLocations = 'Địa điểm làm việc:',
        experience = 'Kinh nghiệm:',
        skills = "Yêu cầu bằng cấp:",
        catagories = 'Ngành nghề:',
        benefits = "Quyền lợi được hưởng",
        jobDescription = "Mô tả công việc",
        jobRequirement = "Yêu cầu ứng viên",
        other = "Yêu cầu khác",
        onlineDate = "Ngày làm mới:"
    }
    let benefits: String[] = [];
    let categories: string[] = [];
    let companyLogo = document.querySelector('div.logo-company img')?.getAttribute('src') || '';
    let onlineDate: string = '';
    let experience: string = '';
    let skills: string[] = [];
    let jobLocations: string[] = [];
    let jobType: string = '';
    let jobDescription: string = '';

    let jobDetailContentEles = Array.from(document.querySelectorAll('div.job_description div div.item'));
    if (jobDetailContentEles.length > 0) {
        for (let index = 0; index < jobDetailContentEles.length; index++) {
            const element = jobDetailContentEles[index];
            const title = element.querySelector('div.tit')?.textContent || '';
            switch (title) {
                case Constant.jobDescription:
                case Constant.other:
                case Constant.benefits:
                    if (Constant.benefits === element.textContent) {
                        benefits = Array.from(element.querySelectorAll('p.desc')).map(ele => ele.textContent || '');
                    }
                    jobDescription += element.outerHTML
                    break;
                default:
                    break;
            }
        }
        jobDescription = `<div>${jobDescription}</div>`;

        const onlineDateEles = Array.from(document.querySelectorAll('div.box_chi_tiet_cong_viec div.title-info div.row div.float-left div.fs-12 span'));
        for (const element of onlineDateEles) {
            if (element.textContent?.includes(Constant.onlineDate)) {
                onlineDate = element.textContent.replace(Constant.onlineDate, '').trim();
            }
        }

        const jobInfoEles = Array.from(document.querySelectorAll('div.box_chi_tiet_cong_viec div.job_detail div.list-info div.line-icon'));
        for (const element of jobInfoEles) {
            let keyELe = element.querySelector('span.font500');
            let valueELe = element.querySelector('span.job_value');
            switch (keyELe?.textContent) {
                case Constant.experience:
                    experience = valueELe?.textContent || '';
                    break;
                case Constant.skills:
                    skills = valueELe?.textContent?.replace("...", '').split(',') || [];
                    break;
                case Constant.catagories:
                    categories = Array.from(element.querySelectorAll('a')).map(ele => ele.textContent?.trim() || '');
                    break;
                case Constant.jobLocations:
                    jobLocations = Array.from(element.querySelectorAll('a')).map(ele => ele.textContent?.trim() || '');
                    break;
                case Constant.jobType:
                    jobType = valueELe?.textContent || '';
                    break
                default:
                    break;
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
        let nextPage = await getNextPage(page) || URLCraw.vieclam24h;
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
                jobId: Prefix.vieclam24h + job.jobId
            });
            await saveJob(item);
            const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
            await delay(number);
            items.push(item);
        }
        await saveConfig({ name: URLConstants.vieclam24h, page: nextPage });
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
        //        throw new Error(err);
    }

}

const Vieclam24h = {
    getNextPage,
    getJobInPage
}

export default Vieclam24h;