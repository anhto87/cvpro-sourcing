import Logger from "../crawl/Log";
import Crawl from '../crawl/craw'
import '../database';
import { createPuppeteerBrowser } from "../crawl/helper";
import { URLConstants, URLCraw } from "../crawl/constants/constant";
import { Browser } from "puppeteer";

async function getJobs(url: string, browser: Browser, domain: string, maxPage: number = 1, delayTime: number): Promise<boolean> {
    for (let index = 0; index < maxPage; index++) {
        let items = await Crawl.page(url, browser, domain, index === 0 ? delayTime : 1);
        if (items.length === 0) {
            Logger.info(`Craw $${domain} done`)
            return false;
        }
    }
    Logger.info(`Craw $${domain} done`)
    return true
}


/**
 * careerlink, careerbuilder: 50jobs/page 
 * itviec, vieclam24h, timViecNhanh, viecTotNhat: 20jobs/page * 2 page = 40job
 * jobsGo: 40jobs/page * 1 page = 40job
 * topcv: 25jobs/page * 2page = 50job
 * vlance: 10jobs/page * 5page = 50job
 * 
 * TOTAL: 400JOB/TURN
 * EST RUN TIME: 50(maxJob/page) * 60(config.maxDelayTime) ~ 50mins
 */
async function scrapeWithSchedule() {
    try {
        const newBrowser = await createPuppeteerBrowser();
        const kUnix = 60;
        let res = await Promise.all([
            getJobs(URLCraw.careerLink, newBrowser, URLConstants.careerLink, 1, 1),
            getJobs(URLCraw.careerbuilder, newBrowser, URLConstants.careerbuilder, 1, 1),
            getJobs(URLCraw.itviec, newBrowser, URLConstants.itviec, 2, kUnix),
            getJobs(URLCraw.jobsGo, newBrowser, URLConstants.jobsGo, 1, kUnix),
            getJobs(URLCraw.timViecNhanh, newBrowser, URLConstants.timViecNhanh, 2, kUnix * 2),
            getJobs(URLCraw.topcv, newBrowser, URLConstants.topcv, 2, kUnix * 2),
            getJobs(URLCraw.vieclam24h, newBrowser, URLConstants.vieclam24h, 2, kUnix * 3),
            getJobs(URLCraw.viecTotNhat, newBrowser, URLConstants.viecTotNhat, 2, kUnix * 3),
            getJobs(URLCraw.vlance, newBrowser, URLConstants.vlance, 5, kUnix * 4),
        ])
        Logger.info("Craw Job1 done");
        await newBrowser.close();
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

scrapeWithSchedule();
