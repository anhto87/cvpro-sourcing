import puppeteer, { Browser } from 'puppeteer';
import { URLConstants } from './constants/constant';
import Logger from './Log';
import { closePage, createPuppeteerBrowser, delay, setHeader } from './helper';
import { JobsGo, CareerLink, TimViecNhanh, ITViec, Vieclam24h, TopCv, CareerBuilder, ViecTotNhat, TopDev, vlance, yBox } from './index'
import config from '../database/config';
import { getConfigCraw } from '../database/entities';

async function getJobInPage(url: string, browser: puppeteer.Browser, page: puppeteer.Page, maxItem: number = 100) {
    if (url.includes(URLConstants.careerLink)) {
        return CareerLink.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.vieclam24h)) {
        return Vieclam24h.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.topcv)) {
        return TopCv.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.timViecNhanh)) {
        return TimViecNhanh.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.jobsGo)) {
        return JobsGo.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.itviec)) {
        return ITViec.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.careerbuilder)) {
        return CareerBuilder.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.viecTotNhat)) {
        return ViecTotNhat.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.topdev)) {
        return TopDev.getJobInPage(url, browser, page, maxItem);
    } else if (url.includes(URLConstants.vlance)) {
        return vlance.getJobInPage(url, browser, page);
    } else if (url.includes(URLConstants.xBox)) {
        return yBox.getJobInPage(url, browser, page, maxItem);
    }
    return []
}

const getNextPage = async (page: puppeteer.Page, url: string) => {
    if (url.includes(URLConstants.careerLink)) {
        return CareerLink.getNextPage(page);
    } else if (url.includes(URLConstants.vieclam24h)) {
        return Vieclam24h.getNextPage(page);
    } else if (url.includes(URLConstants.topcv)) {
        return TopCv.getNextPage(page);
    } else if (url.includes(URLConstants.timViecNhanh)) {
        return TimViecNhanh.getNextPage(page);
    } else if (url.includes(URLConstants.jobsGo)) {
        return JobsGo.getNextPage(page);
    } else if (url.includes(URLConstants.itviec)) {
        return ITViec.getNextPage(page);
    } else if (url.includes(URLConstants.careerbuilder)) {
        return CareerBuilder.getNextPage(page);
    } else if (url.includes(URLConstants.viecTotNhat)) {
        return ViecTotNhat.getNextPage(page);
    } else if (url.includes(URLConstants.topdev)) {
        return TopDev.getNextPage(page);
    } else if (url.includes(URLConstants.vlance)) {
        return vlance.getNextPage(page);
    }
    return null;
}

const getTotalItems = async (page: puppeteer.Page, url: string): Promise<number | undefined> => {
    if (url.includes(URLConstants.topdev)) {
        return await page.evaluate(TopDev.getTotalItems);
    } else if (url.includes(URLConstants.xBox)) {
        return await page.evaluate(yBox.getTotalItems);
    }
    return undefined;
}

async function page(url: string, browser: puppeteer.Browser | undefined, domain: string) {
    try {
        const number = (Math.floor(Math.random() * (config.maxDelayTime - config.minDelayTime)) + config.minDelayTime) * 1000;
        await delay(number)
        const configCraw = await getConfigCraw(domain);
        let currentUrl = url
        if (configCraw) {
            currentUrl = configCraw.page || url;
        }
        const newBrowser = browser || await createPuppeteerBrowser();
        const page = await newBrowser.newPage();
        await setHeader(page);
        Logger.info(`Starting load ${currentUrl}`);
        let items = await getJobInPage(currentUrl, newBrowser, page);
        await closePage(page);
        if (!browser) {
            await newBrowser.close();
        }
        Logger.info(`Load done: ${domain} count: ${items.length}`);
        return items;
    } catch (err) {
        Logger.error(err);
        return [];
        // throw new Error(err);
    }
}

async function all(url: string, browser?: puppeteer.Browser, delayTime: number = 60, maxPage: number = 1000) {
    try {
        const number = delayTime * 1000;
        await delay(number);
        const newBrowser = browser || await createPuppeteerBrowser();
        let nextPage: string | null | undefined = url;
        let curentPage = 1;
        while (nextPage) {
            Logger.info(`Load data next page: ${nextPage}`);
            const page = await newBrowser.newPage();
            await setHeader(page);
            await getJobInPage(nextPage, newBrowser, page);
            if (curentPage < maxPage) {
                nextPage = await getNextPage(page, url);
                curentPage += 1;
                Logger.info(`Load set nextPage ${nextPage}`);
            } else {
                nextPage = null;
                Logger.info(`Load set nextPage ${nextPage}`);
            }
        }
        if (!browser) {
            await newBrowser.close();
        }
        Logger.info(`Load getJobInPage done ${url}`);
        return true
    } catch (err) {
        Logger.error(`Error: ${url} ${JSON.stringify(err)}`)
        return false;
    }
}

async function pageInfinite(url: string, browser?: puppeteer.Browser, maxItem: number = 20) {
    try {
        const newBrowser = browser || await createPuppeteerBrowser();
        const page = await newBrowser.newPage();
        await setHeader(page);
        let totalJob: number = 0;
        Logger.info(`Load data next page: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: config.timeout });
        Logger.info(`Loadmore: ${url}`);
        while (totalJob < maxItem) {
            let total = await getTotalItems(page, url);
            if (total) {
                Logger.info(`Total: ${total}`)
                if (total >= maxItem) {
                    totalJob = maxItem
                } else {
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                    await page.waitForTimeout(5000);
                    total = await getTotalItems(page, url);
                    Logger.info(`Total: ${total}`);
                    totalJob = total ? total : maxItem;
                }
            } else {
                Logger.info(`Total: ${total} break`)
                totalJob = maxItem;
            }

        }
        let items = await getJobInPage(url, newBrowser, page, maxItem);
        if (!browser) {
            newBrowser.process()?.kill();

        }
        return items
    } catch (err) {
        Logger.error(JSON.stringify(err))
        return [];
    }
}

const Crawl = {
    all,
    page,
    pageInfinite
}

export default Crawl;