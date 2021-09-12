import { model, Schema, Model } from 'mongoose';

interface Log {
    name: string,
    content: string
}

export const LogSchema: Schema<Log> = new Schema<Log>({
    name: String,
    content: String
}, { timestamps: true });

export const LogModel: Model<Log> = model('logs', LogSchema);

export async function saveLog(config: Log) {
    try {
        await LogModel.create(config);
        return true
    } catch (e) {
        return false;
    }
}

