import React from 'react';
import { Typography } from 'antd';
import { CVPRO, NhanSuVietNam, vietnamwork } from '../../global/helpers';
const { Text } = Typography;

export const JobDescription = ({ job }) => {


    if (job) {
        const domain = job?.domain || '';
        if (domain.includes(vietnamwork) || domain.includes(NhanSuVietNam) || domain.includes(CVPRO)) {
            const jobRequirement = job?.jobRequirement || '';
            const jobDescription = job?.jobDescription || '';
            return <>
                <div className="marT20">
                    <div className="title-info fontW700">
                        <Text>Mô tả công việc</Text>
                    </div>
                    <Text className="break-line">{jobDescription}</Text>
                </div>
                {jobRequirement.length > 0 && (
                    <div className="marT20">
                        <div className="title-info fontW700">
                            <Text>Yêu cầu công việc</Text>
                        </div>
                        <Text className="break-line">{jobRequirement}</Text>
                    </div>
                )}
            </>

        }
        return <div className="marT20" dangerouslySetInnerHTML={{ __html: job?.jobDescription }} />
    }

    return null;
}