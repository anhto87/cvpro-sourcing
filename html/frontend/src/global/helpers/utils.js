/***
 * 
 * 
 * 
 * 
 */

import { FilterJobTypes, FilterTimes } from "./constants";

export const getListJobURL = ({ keyword, address, time, page, jobType }) => {
    let querys = { keyword, address };
    if (time && time !== FilterTimes.all) {
        querys['t'] = time;
    }

    if (jobType && jobType !== FilterJobTypes.all) {
        querys['type'] = jobType;
    }
    if (page && page !== 1) {
        querys['page'] = page;
    }
    let searchParams = new URLSearchParams(querys).toString();
    return `/tim-viec?${searchParams}`;
}

export const getJobDetailURL = (item) => {
    const jobTitleSlug = item?.jobTitleSlug || slugify(item.jobTitle);
    return `/tim-viec/${jobTitleSlug || ''}-${item._id}`;
}

export const getTopJobDetailURL = (item) => {
    const jobTitleSlug = item?.jobTitleSlug || slugify(item.jobTitle);
    return `/tim-viec/top/${jobTitleSlug || ''}-${item._id}`;
}

export const slugify = (str, separator = "-") => {
    return str
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, separator);
};

export const convertSuggestJob = (jobs) => {
    const items = [];
    const maxLength = jobs.length > 10 ? 10 : jobs.length;
    for (let index = 0; index < maxLength; index++) {
        const job = jobs[index];
        const _id = job?.id;
        const jobId = job?.id;
        const jobTitle = job?.job_title;
        const companyLogo = job?.employer?.logo;
        const company = job?.employer?.company;
        const companyId = job?.employer?.id;
        const jobDescription = job?.description || '';
        let jobRequirement = '';
        if (job?.educational_requirements && job.educational_requirements.length > 0) {
            jobRequirement += job.educational_requirements + "\n"
        }
        if (job?.experience_requirements && job.experience_requirements.length > 0) {
            jobRequirement += job.experience_requirements + "\n"
        }
        if (job?.additional_requirements && job.additional_requirements.length > 0) {
            jobRequirement += job.additional_requirements + "\n"
        }
        const salary = convertSalary(job?.salary, job?.salary_upto, job?.salary_currency);
        const jobType = job?.job_type === "full_time" ? "Toàn thời gian" : job?.job_type;
        let address = '';
        if (job?.city_name && job.city_name.length > 0) {
            address += job.city_name;
        }
        if (job?.state_name && job.state_name.length > 0) {
            address += (address.length > 0 ? ", " : "") + job.state_name;
        }
        const jobLocations = [address];
        const locations = [address];
        const skills = [];
        const skill = job?.skills || '';
        if (skill.length > 0) {
            skills.push(skill);
        }
        const benefits = [job?.benefits || ''];
        const domain = 'cvpro.top';
        const link = `https://cvpro.top/job/${jobId}`;
        const onlineDate = job?.updated_at;
        const publishedDate = job?.created_at;
        const expiredDate = job?.deadline;
        items.push({
            expiredDate,
            publishedDate,
            link,
            onlineDate,
            jobType,
            jobLocations,
            skills,
            benefits,
            locations,
            _id,
            domain,
            jobId,
            jobTitle,
            companyLogo,
            company,
            companyId,
            jobDescription,
            jobRequirement,
            salary,
        });
    }
    return items;
};

const convertSalary = (salary, salary_upto, salary_currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: salary_currency
    });

    if (typeof salary === 'number' && typeof salary_upto === 'number') {
        const min = formatter.format(salary);
        const max = formatter.format(salary_upto);

        return `${min} - ${max}`;
    }

    return null;
};