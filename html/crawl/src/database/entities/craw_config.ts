import { model, Schema, Model, Document, SchemaType, SchemaTypes } from 'mongoose';
import { clean } from '../../crawl/helper';
import Logger from '../../crawl/Log';

interface CrawConfig {
    name: string,
    page?: string
}

export const ConfigSchema: Schema<CrawConfig> = new Schema<CrawConfig>({
    name: String,
    page: String
}, { timestamps: true });

export const ConfigModel: Model<CrawConfig> = model('craws', ConfigSchema);

export const getConfigCraw = async (name: string): Promise<CrawConfig | null> => {
    try {
        let config = await ConfigModel.findOne({ name })
        return config;
    } catch (error) {
        Logger.error(error);
        return null;
    }
}

export async function saveConfig(config: CrawConfig) {
    try {
        const newObj = clean(config);
        let record = await ConfigModel.findOne({
            name: config.name
        })
        if (record) {
            await ConfigModel.updateOne({ _id: record._id }, newObj);
        } else {
            await ConfigModel.create(newObj);
        }
        return true
    } catch (e) {
        return false;
    }
}

