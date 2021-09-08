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
        ])
        Logger.info(res);
        Logger.info("Craw Job2 done");
        await newBrowser.close();
        process.exit();
    } catch (error) {
        process.exit();
    }
}

scrapeWithSchedule();
