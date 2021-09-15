import Logger from "./crawl/Log";
import Crawl from './crawl/craw'
import './database';
import { createPuppeteerBrowser } from "./crawl/helper";
import { URLConstants, URLCraw } from "./crawl/constants/constant";

async function scrapeWithSchedule() {

    const newBrowser = await createPuppeteerBrowser();
    await Crawl.page(URLCraw.careerLink, newBrowser, URLConstants.careerLink, 1);
    Logger.info("Craw data done");
}

scrapeWithSchedule();
