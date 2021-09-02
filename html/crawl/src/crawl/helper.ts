import moment from 'moment';
import puppeteer from 'puppeteer';
import { Job } from '../database/entities';
import { CareerBuilderJob } from './careerbuilder';

export async function setHeader(page: puppeteer.Page) {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');
}

export async function scrollToBottom(page: puppeteer.Page) {
    let offset = 0;
    let height = await page.evaluate(() => {
        return document.body.offsetHeight;
    });
    while (height > offset) {
        offset += await page.evaluate(() => {
            window.scrollTo({ top: window.scrollY + window.innerHeight, behavior: 'smooth' });
            return window.innerHeight
        });
        await page.waitForTimeout(500);
    }
}

export function clean(obj: any) {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj
}

const toDate = (str: string | undefined) => {
    if (str) {
        let date = moment(str, moment.ISO_8601, true).isValid();
        if (date) {
            return moment(str, moment.ISO_8601).toDate();
        } else if (moment(str, 'DD/MM/YYYY', true).isValid()) {
            return moment(str, 'DD/MM/YYYY').toDate();
        } else if (moment(str, 'DD-MM-YYYY', true).isValid()) {
            return moment(str, 'DD-MM-YYYY').toDate();
        } else if (moment(str, 'YYYY-MM-DD', true).isValid()) {
            return moment(str, 'YYYY-MM-DD').toDate();
        } else if (moment(str, 'D-M-YYYY').isValid()) {
            return moment(str, 'D-M-YYYY').toDate();
        }
    }
    return undefined
}

export const convertToJob = (job: CareerBuilderJob): Job => {

    const publishedDate = toDate(job.publishedDate);
    const expiredDate = toDate(job.expiredDate);
    const onlineDate = toDate(job.onlineDate);

    return {
        jobId: job.jobId?.trim(),
        jobTitle: job.jobTitle?.trim(),
        companyLogo: job.companyLogo?.trim(),
        company: job.company?.trim(),
        jobDescription: job.jobDescription,
        jobRequirement: job.jobRequirement,
        experience: job.experience?.trim(),
        jobType: job.jobType?.trim(),
        jobLocations: job.jobLocations,
        locations: job.locations,
        categories: job.categories,
        skills: job.skills,
        benefits: job.benefits,
        domain: job.domain?.trim(),
        link: job.link?.trim(),
        publishedDate,
        expiredDate,
        onlineDate,
        salary: job.salary?.trim()
    }
}
//Cập nhật 4 phút trước
//Cập nhật 5 giờ trước
//Cập nhật 2 tuần trước
//Cập nhật 1 ngày trước
//1h
//1d
//5 hours ago
//1 day ago
//2 tháng trước
// 40 giây trước
//tháng trước
//Hôm qua
export const convertTimeAgoToDate = (time: string) => {
    console.log(time);
    if (time.length < 4) {
        if (time.includes('h')) {
            let number = parseInt(time.replace('h', '').trim());
            return number ? moment().add(-number, 'hour').toISOString() : ''
        }
        if (time.includes('d')) {
            let number = parseInt(time.replace('d', '').trim());
            return number ? moment().add(-number, 'day').toISOString() : ''
        }
        if (time.includes('m')) {
            let number = parseInt(time.replace('m', '').trim());
            return number ? moment().add(-number, 'minute').toISOString() : ''
        }
        return time
    }
    let components = time.replace('Cập nhật', '').trim().split(' ');
    if (components.length < 0) {
        return ''
    }

    //28 ngày 12 giờ
    if (time.includes('ngày') && time.includes('giờ') && components.length === 4) {
        let date = moment().add(parseInt(components[0]), 'day')
        return date.add(parseInt(components[2]), 'hour').toISOString()
    }

    let number = parseInt(components[0]);
    if (time.includes('giây')) {
        return moment().add(-(isNaN(number) ? 1 : number), 'second').toISOString()
    }

    if (time.includes('phút')) {
        return moment().add(-(isNaN(number) ? 1 : number), 'minute').toISOString()
    }

    if (time.includes('giờ') || time.includes('hours') || time.includes('hour')) {
        return moment().add(-(isNaN(number) ? 1 : number), 'hour').toISOString()
    }

    if (time.includes('tuần')) {
        return moment().add(-(isNaN(number) ? 1 : number) * 7, 'day').toISOString()
    }

    if (time.includes('một')) {
        return moment().add(-1, 'day').toISOString()
    }

    if (time.includes('ngày') || time.includes('day') || time.includes('days')) {
        return moment().add(-(isNaN(number) ? 1 : number), 'day').toISOString()
    }

    if (time.includes('tháng')) {
        return moment().add(-(isNaN(number) ? 1 : number), 'month').toISOString()
    }

    if (time.includes('Hôm qua')) {
        return moment().add(-1, 'day').toISOString()
    }

    if (time.includes('Hôm kia')) {
        return moment().add(-2, 'day').toISOString()
    }

    return ''
}