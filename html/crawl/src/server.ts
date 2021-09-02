import express from 'express';
import Crawl from './crawl/craw';

import './database';
import { Jobs } from './database/entities';
const app = express();
const PORT = 8000;

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.get('/jobs', (req, res) => {
    let limit = parseInt(req.query.limit as string || '200');
    let page = parseInt(req.query.page as string || '0');
    let domain: string = (req.query.domain as string) || '';
    res.setHeader('Content-Type', 'application/json');
    Jobs.find({domain: domain}).sort({onlineDate: 'desc'})
        .limit(limit)
        .skip(page * limit).then(items => {
            res.send(JSON.stringify({ items }, null, '\t'));
        }).catch(error => {
            res.send(JSON.stringify({ error }, null, '\t'));
        })
})

app.get('/crawl', (req, res) => {
    let url = req.query.url as string;
    res.setHeader('Content-Type', 'application/json');
    Crawl.page(url)
        .then(items => res.send(JSON.stringify({ items, count: items.length }, null, '\t')))
})

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});