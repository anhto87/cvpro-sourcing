import moment from 'moment';
import puppeteer from 'puppeteer';
import { Job } from '../database/entities';
import { CareerBuilderJob } from './careerbuilder';

export const slugify = (str: string, separator = "-") => {
    return str
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, separator);
};

export const createPuppeteerBrowser = async () => {
    return await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
}

export const closePage = async (page: puppeteer.Page) => {
    await page.goto('about:blank');
    await page.close();
}

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
    for (const propName in obj) {
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

    const jobTitleSlug = slugify(job.jobTitle?.trim() || '');
    const locations = job.locations || [];
    const locationsEN = locations.map(ele => slugify(ele, ' '));
    const expiredTimestamp = expiredDate ? expiredDate?.getTime() / 1000 : undefined;
    const onlineTimestamp = onlineDate ? onlineDate?.getTime() / 1000 : undefined;
    const publishedTimestamp = publishedDate ? publishedDate?.getTime() / 1000 : undefined;

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
        locations,
        locationsEN,
        categories: job.categories,
        skills: job.skills,
        benefits: job.benefits,
        domain: job.domain?.trim(),
        link: job.link?.trim(),
        publishedDate,
        expiredDate,
        onlineDate,
        salary: job.salary?.trim(),
        jobTitleSlug,
        publishedTimestamp,
        expiredTimestamp,
        onlineTimestamp
    }
}

export const convertTimeAgoToDate = (time: string) => {
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
    console.log(components)
    if (time.includes('ngày') && time.includes('giờ') && components.length === 4) {
        let date = moment().add(-parseInt(components[0]), 'day')
        return moment(date).add(-parseInt(components[2]), 'hour').toISOString()
    }

    //4 giờ, 7 phút trước
    if (time.includes('giờ') && time.includes('phút') && components.length === 5) {
        let date = moment().add(-parseInt(components[0]), 'hour');
        let dateString = moment(date).add(-parseInt(components[2]), 'minute').toISOString();
        return dateString;
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

    // Hôm qua, 21:54
    if (time.includes('Hôm qua,')) {
        const yesterday = moment().add(-1, 'day');
        const newTime = time.replace('Hôm qua', yesterday.format('DD/MM/YYYY'))
        return moment(newTime, 'DD/MM/YYYY, HH:mm').toISOString()
    }

    // Hôm nay, 13:50
    if (time.includes('Hôm nay,')) {
        const today = moment();
        const newTime = time.replace('Hôm nay', today.format('DD/MM/YYYY'))
        return moment(newTime, 'DD/MM/YYYY, HH:mm').toISOString()
    }

    if (time.includes('Hôm kia,')) {
        const yesterday = moment().add(-2, 'day');
        const newTime = time.replace('Hôm nay', yesterday.format('DD/MM/YYYY'))
        return moment(newTime, 'DD/MM/YYYY, HH:mm').toISOString()
    }

    if (time.includes('Hôm qua')) {
        return moment().add(-1, 'day').toISOString()
    }

    if (time.includes('Hôm kia')) {
        return moment().add(-2, 'day').toISOString()
    }

    //14/08/2021, 17:41
    if (moment(time, 'DD/MM/YYYY, HH:mm', true).isValid()) {
        return moment(time, 'DD/MM/YYYY, HH:mm').toISOString()
    }

    return ''
}

export const convertExpireDate = (time: string) => {
    if (time === "Đã chọn freelancer" || time === 'Hết hạn chào giá ') {
        return undefined;
    }
    let components = time.trim().split(' ');
    if (components.length < 0) {
        return ''
    }

    //2 ngày 22 giờ
    if (time.includes('ngày') && time.includes('giờ') && components.length === 4) {
        let date = moment().add(parseInt(components[0]), 'day')
        let dateString = moment(date).add(parseInt(components[2]), 'hour').toISOString()
        return dateString
    }

    //16 giờ 59 phút
    if (time.includes('giờ') && time.includes('phút') && components.length === 4) {
        let date = moment().add(parseInt(components[0]), 'hour')
        let dateString = moment(date).add(parseInt(components[2]), 'minute').toISOString()
        return dateString
    }

    return ''
}