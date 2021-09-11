/***
 *
 *
 *
 */
export const UPDATE_FORM = 'UPDATE_FORM';
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const LOAD_COMPLETE = 'LOAD_COMPLETE';
export const LOADING = 'LOADING';
export const RESET = 'RESET';
export const JOB_SUGGEST = 'JOB_SUGGEST';

export const updateFormValues = (payload) => {
    return {
        type: UPDATE_FORM,
        payload
    };
};

export const updatePageAction = (payload) => {
    return {
        type: UPDATE_PAGE,
        payload
    };
};

export const loadCompletedAction = ({ jobs, totalJobs, page, totalPage, limit }) => {
    return {
        type: LOAD_COMPLETE,
        payload: { jobs, totalJobs, page, totalPage, limit }
    };
};

export const loading = (payload) => {
    return {
        type: LOADING,
        payload
    };
};

export const resetAction = () => {
    return {
        type: RESET
    };
};

export const jobsSuggestAction = (jobs) => {
    return {
        type: JOB_SUGGEST,
        payload: convertSuggestJob(jobs)
    };
};

const convertSuggestJob = (jobs) => {
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
        const jobDescription = job?.description;
        const jobRequirement = (job?.educational_requirements || '') + '\n' + (job?.experience_requirements || '') + '\n' + job?.additional_requirements + '\n';
        const salary = convertSalary(job?.salary, job?.salary_upto, job?.salary_currency);
        const jobType = job?.job_type;
        const jobLocations = [(job?.city_name || '') + (job?.state_name || '')];
        const locations = [(job?.city_name || '') + (job?.state_name || '')];
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