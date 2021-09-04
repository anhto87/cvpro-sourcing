/**
 * 
 * Job
 * 
 */
import { model, Schema, Model, Document, SchemaType, SchemaTypes } from 'mongoose';
import { downloadImage } from '../../crawl/downloadImage';
import { clean } from '../../crawl/helper';
import Logger from '../../crawl/Log';

export interface Job {
  jobId?: string;
  jobTitle?: string;
  companyLogo?: string;
  company?: string;
  companyId?: string;
  jobDescription?: string;// not ok
  jobRequirement?: string;// not ok
  salaryMax?: number;//not ok
  salaryMin?: number;//not ok
  salary?: string;
  experience?: string;//not ok
  jobType?: string;//not ok
  jobLocations?: string[];//not ok
  locations?: string[];
  locationsEN?: string[];
  categories?: string[];//not ok // ["IT - Phần mềm", "Nhân sự", "IT-Phần cứng/Mạng"]
  skills?: string[];
  benefits?: any[];
  data?: any;
  domain?: string;
  link?: string;
  publishedDate?: Date;//not ok
  expiredDate?: Date;
  onlineDate?: Date;
  jobTitleSlug?: string;
  publishedTimestamp?:number;
  expiredTimestamp?: number,
  onlineTimestamp?:number
}

export const JobSchema: Schema<Job> = new Schema<Job>({
  jobId: String,
  jobTitle: String,
  companyLogo: String,
  company: String,
  companyId: String,
  jobDescription: String,
  jobRequirement: String,
  salaryMax: Number,
  salaryMin: Number,
  salary: String,
  experience: String,
  jobType: String,
  jobLocations: [String],
  locations: [String],
  locationsEN: [String],
  categories: [String],
  skills: [String],
  benefits: [SchemaTypes.Mixed],
  data: {
    type: String,
    get: function (data: string) {
      try {
        return JSON.parse(data);
      } catch (err) {
        return data;
      }
    },
    set: function (data: any) {
      return JSON.stringify(data);
    }
  },
  domain: String,
  link: String,
  expiredDate: Date,
  publishedDate: Date,
  onlineDate: Date,// thời gian lắm mới job => chắc là đẩy job lên top
  jobTitleSlug:String,
  publishedTimestamp:Number,
  expiredTimestamp:Number,
  onlineTimestamp:Number,
});

export async function saveJob(job: Job) {
  try {
    let cleanJob = clean(job);
    if (job.companyLogo && job.companyLogo.length > 0) {
      let companyLogo = await downloadImage(job.companyLogo)
      if (companyLogo) {
        cleanJob.companyLogo = companyLogo;
      }
    }
    let record = await Jobs.findOneAndUpdate({ jobId: cleanJob.jobId }, { ...cleanJob }, { new: true, upsert: true });
    if (record) {
      // Logger.info(`saveJob successful ${record?.jobId} ${record.link}`);
      return true
    } else {
      let create = await Jobs.create(cleanJob);
      if (create) {
        // Logger.info(`saveJob successful ${create?.jobId} ${create.link}`);
        return true
      }
    }
    // Logger.info(`saveJob faild${cleanJob?.jobId} ${cleanJob.link} `);
    return false;
  } catch (e) {
    // Logger.error(`saveJob faild ${job.link} ${job.companyLogo} ${e}`);
    return false;
  }
}

export const Jobs: Model<Job> = model('Jobs', JobSchema);