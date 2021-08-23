import { connect } from 'mongoose';
import config from './config';

async function run(): Promise<void> {
    await connect(config.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connect to MongoDB")
}

run().catch(err => console.log(err));
