import './JobDetail.css';
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from "react-router-dom";
import { Row, Col, Button, Form, Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '../../global/helpers/date';
import { SearchForm } from '../../components/SearchForm';
import { getListJobURL, LogoName } from '../../global/helpers';
const { Title, Text } = Typography;
const { Content, Footer } = Layout;

export const JobDetail = (props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();
    const [form] = Form.useForm();
    const [job, setJob] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const jobItem = location.state;
        if (jobItem) {
            setJob(jobItem);
        }
        document.title = jobItem?.jobTitle;
    }, [])

    const onPressGoHome = () => {
        history.push('/')
    }

    const onPressSubmit = () => {
        let url = getListJobURL({ keyword, address });
        history.push(url);
    }

    const skills = Array.isArray(job?.skills) ? job.skills : [];
    const locations = Array.isArray(job?.locations) ? job.locations : [];
    const timeStr = timeAgo(job?.onlineDate);
    const jobLocations = Array.isArray(job?.jobLocations) ? job.jobLocations : [];
    const categories = Array.isArray(job?.categories) ? job.categories : [];
    const experience = job?.experience || '';
    const jobType = job?.jobType || '';
    const salary = job?.salary || '';

    const JobInfoTextELement = ({ title, arr }) => {
        return (
            <div>
                <div className="title-info fontW700">
                    <Text>{title}</Text>
                </div>
                <Text className="pad20">{arr.map(ele => ele.trim()).join(',')}</Text>
            </div>
        )
    }

    const JobInfoButtonELement = ({ title, arr }) => {
        return (
            <div>
                <div className="title-info fontW700">
                    <Text>{title}</Text>
                </div>
                <Row justify="start" style={{ marginTop: 10 }}>
                    {
                        arr.map((ele, index) => {
                            return (
                                <Col key={`${ele}_${index}`} className="job-skill">
                                    <Text >{ele}</Text>
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        )
    }

    return (
        <>
            <Row justify='space-between' align='middle' className="header">
                <Col className="logo-header">
                    <Typography.Link style={{ color: 'black' }} onClick={onPressGoHome}>{LogoName}</Typography.Link>
                </Col>
            </Row>
            <Content>
                <Row justify='center' align='top'>
                    <div className="content" style={{ marginBottom: 100 }}>
                        <SearchForm
                            form={form}
                            keyword={keyword}
                            address={address}
                            onChangeAddress={(e) => setAddress(e)}
                            onChangeKeyword={e => setKeyword(e)}
                            onPressSubmit={onPressSubmit}
                        />
                        <Row wrap={false}>
                            <Col style={{ paddingTop: 20 }}>
                                <Title level={4}>{job?.jobTitle || ''}</Title>
                                <div className="title-info fontW600">
                                    <Text>{job?.company}</Text>
                                    <Text className="fontW400">{locations.length > 0 ? ` - ${locations.join(",")}` : null}</Text>
                                </div>
                                <div>
                                    <Text className="listed-date">{`${timeStr} ${t('home.from')} ${job?.domain}`}</Text>
                                </div>
                                <Row>
                                    <Col span={12}>
                                        {jobLocations.length > 0 && <JobInfoTextELement title={t('home.workLocation')} arr={jobLocations} />}
                                    </Col>
                                    <Col span={12}>
                                        {experience.length > 0 && <JobInfoTextELement title={t('home.experience')} arr={[experience]} />}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={12}>
                                        {categories.length > 0 && <JobInfoButtonELement title={t('home.career')} arr={categories} />}
                                    </Col>
                                    <Col span={12}>
                                        {skills.length > 0 && <JobInfoButtonELement title={t('home.skill')} arr={skills} />}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12}>
                                        {jobType.length > 0 && <JobInfoTextELement title={t('home.jobType')} arr={[jobType]} />}
                                    </Col>
                                    <Col span={12}>
                                        {salary.length > 0 && <JobInfoTextELement title={t('home.salary')} arr={[salary]} />}
                                    </Col>
                                </Row>
                                <div style={{ marginTop: 20 }} dangerouslySetInnerHTML={{ __html: job?.jobDescription }} />
                                <div style={{ padding: 30 }}>
                                    <Button
                                        style={{ width: '100%' }}
                                        onClick={() => window.open(job?.link, '_blank').focus()}
                                        type="primary"
                                        htmlType="submit"
                                        shape="round"
                                        className="submit-button">
                                        {t('home.apply')}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </>
    )
};