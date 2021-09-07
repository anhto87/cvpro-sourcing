import { VietNamWorkWithPage } from "./crawl";
import Logger from "./crawl/Log";
import Crawl from './crawl/craw'
import { CronJob } from 'cron';
import './database';
import { createPuppeteerBrowser } from "./crawl/helper";

async function scrapeWithSchedule() {

    // const newBrowser = await createPuppeteerBrowser();
    // let job1 = Promise.all([
    //     Crawl.all('https://www.vlance.vn/viec-lam-freelance', newBrowser, 5), //10job/page
    //     Crawl.all('https://careerbuilder.vn/viec-lam/tat-ca-viec-lam-vi.html', newBrowser, 1), //50job/page
    //     Crawl.all('https://jobsgo.vn/viec-lam.html', newBrowser, 1),//40job/page
    //     Crawl.all('https://www.topcv.vn/tim-viec-lam-moi-nhat', newBrowser, 2),//25job/page
    //     Crawl.all('https://vieclam24h.vn/tim-kiem-viec-lam-nhanh', newBrowser, 2),//20job/page
    //     Crawl.all('https://itviec.com/it-jobs', newBrowser, 2),//20job
    // ])
    // let job2 = Promise.all([
    //     Crawl.all('https://timviecnhanh.com/vieclam/timkiem?', newBrowser, 2),//20job/page
    //     Crawl.all('https://www.careerlink.vn/vieclam/list', newBrowser, 1),//50jobs/page
    //     Crawl.all('https://viectotnhat.com/viec-lam/tim-kiem', newBrowser, 2),//20job/page
    //     Crawl.pageInfinite('https://topdev.vn/viec-lam-it', newBrowser, 50),
    //     Crawl.pageInfinite('https://ybox.vn/tuyen-dung-viec-lam-tk-c1?keyword=', newBrowser, 50),
    //     VietNamWorkWithPage('https://www.vietnamworks.com/tim-viec-lam/tat-ca-viec-lam?filtered=true', 1)
    // ])

    let res = await Crawl.pageInfinite('https://ybox.vn/tuyen-dung-viec-lam-tk-c1?keyword=', 50)
    Logger.info("Craw data done");
}

scrapeWithSchedule();

// const job = new CronJob('0 52 */1 * * *', function () {
//     Logger.info('Start Job scrapeWithSchedule')
//     scrapeWithSchedule().then((r) => console.log("scrapeWithSchedule done"));
// }, null, true, 'Asia/Ho_Chi_Minh');

// job.start();
