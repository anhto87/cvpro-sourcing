/**
 * 
 * Constant
 * 
 */
export enum URLCraw {
    careerbuilder = "https://careerbuilder.vn/viec-lam/tat-ca-viec-lam-vi.html",
    jobsGo = "https://jobsgo.vn/viec-lam.html",
    vieclam24h = "https://vieclam24h.vn/tim-kiem-viec-lam-nhanh",
    itviec = "https://itviec.com/it-jobs",
    timViecNhanh = "https://timviecnhanh.com/vieclam/timkiem?",
    careerLink = "https://www.careerlink.vn/vieclam/list",
    topcv = "https://www.topcv.vn/tim-viec-lam-moi-nhat",
    viecTotNhat = "https://viectotnhat.com/viec-lam/tim-kiem",
    vlance = "https://www.vlance.vn/viec-lam-freelance",
}

export enum URLConstants {
    vietnamWork = "https://www.vietnamworks.com",
    careerbuilder = "https://careerbuilder.vn",
    jobsGo = "https://jobsgo.vn",
    vieclam24h = "https://vieclam24h.vn",
    itviec = "https://itviec.com",
    timViecNhanh = "https://timviecnhanh.com",
    careerLink = "https://www.careerlink.vn",
    topcv = "https://www.topcv.vn",
    viecTotNhat = "https://viectotnhat.com",
    topdev = "https://topdev.vn",
    vlance = "https://www.vlance.vn",
    xBox = "https://ybox.vn"
}

export enum Prefix {
    jobsGo = "jg_",
    topcv = "tc_",
    vieclam24h = "v24h_",
    itviec = 'iv_',
    timViecNhanh = 'tcn_',
    careerLink = "cl_",
    viecTotNhat = "vtn_",
    topdev = "td_",
    vlance = "vl_",
    xBox = "xb_"
}

export type SalaryRange = {
    max: number;
    min: number;
}

export const DEFAULT_SALARY_RANGE: SalaryRange = {
    max: 0,
    min: 0
}