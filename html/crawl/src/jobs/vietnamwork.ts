import { CronJob } from "cron";
import { VietNamWorkAll } from "../crawl";
import '../database';

const job = new CronJob('0 0 0 */1 * *', function () {
    VietNamWorkAll('https://www.vietnamworks.com/tim-viec-lam/tat-ca-viec-lam?filtered=true');
}, null, true, 'Asia/Ho_Chi_Minh');

job.start();