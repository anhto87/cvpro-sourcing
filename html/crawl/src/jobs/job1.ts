import Logger from "../crawl/Log";
import Crawl from '../crawl/craw'
import '../database';
import { createPuppeteerBrowser } from "../crawl/helper";

async function scrapeWithSchedule() {
    const newBrowser = await createPuppeteerBrowser();
    let res = await Promise.all([
        Crawl.all('https://www.vlance.vn/viec-lam-freelance', newBrowser, 1),
        Crawl.all('https://careerbuilder.vn/viec-lam/tat-ca-viec-lam-vi.html', newBrowser, 120),
        Crawl.all('https://jobsgo.vn/viec-lam.html', newBrowser, 120),
        Crawl.all('https://www.topcv.vn/tim-viec-lam-moi-nhat', newBrowser, 240),
        Crawl.all('https://vieclam24h.vn/tim-kiem-viec-lam-nhanh', newBrowser, 240),
        Crawl.all('https://itviec.com/it-jobs', newBrowser, 450),
        Crawl.all('https://timviecnhanh.com/vieclam/timkiem?', newBrowser, 360),
        Crawl.all('https://www.careerlink.vn/vieclam/list', newBrowser, 360),
        Crawl.all('https://viectotnhat.com/viec-lam/tim-kiem', newBrowser, 1),
    ])
    Logger.info(res);
    Logger.info("Craw all sites done");
}

scrapeWithSchedule();
