import { VietNamWorkAll } from "../crawl";
import Logger from "../crawl/Log";
import '../database';

VietNamWorkAll('https://www.vietnamworks.com/tim-viec-lam/tat-ca-viec-lam?filtered=true').then(() => {
    process.exit();
}).catch(err => {
    Logger.error(`Vietnamwork: ${err}`);
    process.exit();
})