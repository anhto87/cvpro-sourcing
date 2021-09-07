import { VietNamWorkWithPage } from "../crawl";
import Logger from "../crawl/Log";
import Crawl from '../crawl/craw'
import { CronJob } from 'cron';
import '../database';
import { createPuppeteerBrowser } from "../crawl/helper";

async function scrapeWithSchedule() {
    try {
        const newBrowser = await createPuppeteerBrowser();
        let res = await Promise.all([
            Crawl.all('https://itviec.com/it-jobs', newBrowser, 2),//20job
            Crawl.all('https://timviecnhanh.com/vieclam/timkiem?', newBrowser, 2),//20job/page
            Crawl.all('https://www.careerlink.vn/vieclam/list', newBrowser, 1),//50jobs/page
            Crawl.all('https://viectotnhat.com/viec-lam/tim-kiem', newBrowser, 2),//20job/page
            VietNamWorkWithPage('https://www.vietnamworks.com/tim-viec-lam/tat-ca-viec-lam?filtered=true', 1),
            Crawl.all('https://www.vlance.vn/viec-lam-freelance', newBrowser, 5), //10job/page
            Crawl.all('https://careerbuilder.vn/viec-lam/tat-ca-viec-lam-vi.html', newBrowser, 1), //50job/page
            Crawl.all('https://jobsgo.vn/viec-lam.html', newBrowser, 1),//40job/page
            Crawl.all('https://www.topcv.vn/tim-viec-lam-moi-nhat', newBrowser, 2),//25job/page
            Crawl.all('https://vieclam24h.vn/tim-kiem-viec-lam-nhanh', newBrowser, 2),//20job/page
        ]);
        Logger.info(res);
        Logger.info("Craw data done job1");
    } catch (error) {
        Logger.info(`Craw data done job1 error: ${error}`);
    }
}

const job = new CronJob('0 6 */1 * * *', function () {
    Logger.info('Start Job scrapeWithSchedule')
    scrapeWithSchedule().then((r) => console.log("scrapeWithSchedule done"));
}, null, true, 'Asia/Ho_Chi_Minh');

job.start();
