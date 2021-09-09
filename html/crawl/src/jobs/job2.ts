import Logger from "../crawl/Log";
import Crawl from '../crawl/craw'
import '../database';
import { createPuppeteerBrowser } from "../crawl/helper";
import { URLConstants, URLCraw } from "../crawl/constants/constant";

async function scrapeWithSchedule() {

    try {
        const newBrowser = await createPuppeteerBrowser();
        let res = await Promise.all([
            Crawl.page(URLCraw.careerLink, newBrowser, URLConstants.careerLink),
            Crawl.page(URLCraw.careerbuilder, newBrowser, URLConstants.careerbuilder),
            Crawl.page(URLCraw.itviec, newBrowser, URLConstants.itviec),
            Crawl.page(URLCraw.jobsGo, newBrowser, URLConstants.jobsGo),
            Crawl.page(URLCraw.timViecNhanh, newBrowser, URLConstants.timViecNhanh),
            Crawl.page(URLCraw.topcv, newBrowser, URLConstants.topcv),
            Crawl.page(URLCraw.vieclam24h, newBrowser, URLConstants.vieclam24h),
            Crawl.page(URLCraw.viecTotNhat, newBrowser, URLConstants.viecTotNhat),
            Crawl.page(URLCraw.vlance, newBrowser, URLConstants.vlance),
        ])

        // await Crawl.page(URLCraw.careerLink, undefined, URLConstants.careerLink)
        // await Crawl.page(URLCraw.careerbuilder, undefined, URLConstants.careerbuilder)
        // await Crawl.page(URLCraw.itviec, undefined, URLConstants.itviec)
        // await Crawl.page(URLCraw.jobsGo, undefined, URLConstants.jobsGo)
        // await Crawl.page(URLCraw.timViecNhanh, undefined, URLConstants.timViecNhanh)
        // await Crawl.page(URLCraw.topcv, undefined, URLConstants.topcv)
        // await Crawl.page(URLCraw.vieclam24h, undefined, URLConstants.vieclam24h)
        // await Crawl.page(URLCraw.viecTotNhat, undefined, URLConstants.viecTotNhat)
        // await Crawl.page(URLCraw.vlance, undefined, URLConstants.vlance)
        Logger.info(res);
        Logger.info("Craw Job2 done");
        await newBrowser.close();
        process.exit();
    } catch (error) {
        process.exit();
    }
}

scrapeWithSchedule();
