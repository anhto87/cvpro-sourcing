import Fs from 'fs';
import Path from 'path';
import Axios from 'axios';
import md5 from 'md5';
import Logger from './Log';

export async function downloadImage(url: string) {
    try {
        const fileName = `${md5(url)}.jpg`;
        const path = Path.resolve(__dirname, 'images', fileName)

        if (Fs.existsSync(path)) {
            return fileName;
        }

        const writer = Fs.createWriteStream(path)
        const response = await Axios({
            url: encodeURI(url),
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(fileName));
            writer.on('error', (e) => {
                Logger.error(`${e}`);
                resolve(null);
            })
        })
    } catch (e) {
        Logger.error(` url: ${url} ${e}`);
        return null;
    }
}