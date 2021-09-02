import './JobDetail.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { Row, Col, Button, Form, Layout, Typography, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '../../global/helpers';
import { SearchForm } from '../../components/SearchForm';
import { getListJobURL, LogoName } from '../../global/helpers';
import apis from '../../global/helpers/apis';
import { NoData } from '../../components/NoData';
import { JobDescription } from './JobDescription';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

export const JobDetail = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();
    const params = useParams();
    const [form] = Form.useForm();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const jobItem = location.state;
        if (jobItem) {
            setJob(jobItem);
            setLoading(false);
        } else {
            fetchData().then(r => console.log(r));
        }
    }, []);

    useEffect(() => {
        if (job) {
            document.title = job?.jobTitle;
        }
    }, [job]);

    const fetchData = useCallback(async () => {
        const components = (params?.id.split('-') || []);
        const jobId = components.length > 0 ? components[components.length - 1] : null;
        if (jobId) {
            let res = await apis.getJobDetail({ jobId });
            const status = res?.success === 'OK';
            if (status) {
                setJob(res.data);
            } else {
                setJob(null);
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [params?.id]);

    const onPressGoHome = () => {
        history.push('/');
    };

    const onPressSubmit = () => {
        let url = getListJobURL({ keyword, address });
        history.push(url);
    };

    const skills = Array.isArray(job?.skills) ? job.skills : [];
    const locations = Array.isArray(job?.locations) ? job.locations : [];
    const timeStr = timeAgo(job?.onlineDate);
    const jobLocations = Array.isArray(job?.jobLocations) ? job.jobLocations : [];
    const categories = Array.isArray(job?.categories) ? job.categories : [];
    const experience = job?.experience || '';
    const jobType = job?.jobType || '';
    const salary = job?.salary || '';

    const JobInfoTextElement = ({ title, arr }) => {
        return (
            <div>
                <div className='title-info fontW700'>
                    <Text>{title}</Text>
                </div>
                <Text className='pad20'>{arr.map(ele => ele.trim()).join(',')}</Text>
            </div>
        );
    };

    const JobInfoButtonElement = ({ title, arr }) => {
        return (
            <div>
                <div className='title-info fontW700'>
                    <Text>{title}</Text>
                </div>
                <Row justify='start' style={{ marginTop: 10 }}>
                    {
                        arr.map((ele, index) => {
                            return (
                                <Col key={`${ele}_${index}`} className='job-skill'>
                                    <Text>{ele}</Text>
                                </Col>
                            );
                        })
                    }
                </Row>
            </div>
        );
    };

    const NotFound = () => {
        return <Row justify='center'>
            <NoData />
        </Row>;
    };
    console.log(job);
    return (
        <>
            <Row justify='space-between' align='middle' className='header'>
                <Col className='logo-header'>
                    <Typography.Link style={{ color: 'black' }} onClick={onPressGoHome}>{LogoName}</Typography.Link>
                </Col>
            </Row>
            <Content>
                <Row justify='center' align='top'>
                    <div className='content' style={{ marginBottom: 100 }}>
                        <SearchForm
                            form={form}
                            keyword={keyword}
                            address={address}
                            onChangeAddress={(e) => setAddress(e)}
                            onChangeKeyword={e => setKeyword(e)}
                            onPressSubmit={onPressSubmit}
                        />
                        {loading ? <Skeleton /> : job && !loading ? (
                            <Row wrap={false}>
                                <Col style={{ paddingTop: 20 }}>
                                    <Title level={4}>{job?.jobTitle || ''}</Title>
                                    <div className='title-info fontW600'>
                                        <Text>{job?.company}</Text>
                                        <Text
                                            className='fontW400'>{locations.length > 0 ? ` - ${locations.join(',')}` : null}</Text>
                                    </div>
                                    <div>
                                        <Text
                                            className='listed-date'>{`${timeStr} ${t('home.from')} ${job?.domain}`}</Text>
                                    </div>
                                    <Row>
                                        <Col span={experience.length > 0 ? 12 : 24}>
                                            {jobLocations.length > 0 &&
                                            <JobInfoTextElement title={t('home.workLocation')} arr={jobLocations} />}
                                        </Col>
                                        {experience.length > 0 &&
                                        <Col span={12}>
                                            <JobInfoTextElement title={t('home.experience')} arr={[experience]} />
                                        </Col>}
                                    </Row>

                                    <Row>
                                        <Col span={12}>
                                            {categories.length > 0 &&
                                            <JobInfoButtonElement title={t('home.career')} arr={categories} />}
                                        </Col>
                                        <Col span={12}>
                                            {skills.length > 0 &&
                                            <JobInfoButtonElement title={t('home.skill')} arr={skills} />}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12}>
                                            {jobType.length > 0 &&
                                            <JobInfoTextElement title={t('home.jobType')} arr={[jobType]} />}
                                        </Col>
                                        <Col span={12}>
                                            {salary.length > 0 &&
                                            <JobInfoTextElement title={t('home.salary')} arr={[salary]} />}
                                        </Col>
                                    </Row>
                                    <JobDescription job={job} />
                                    <div style={{ padding: 30 }}>
                                        <Button
                                            style={{ width: '100%' }}
                                            onClick={() => window.open(job?.link, '_blank').focus()}
                                            type='primary'
                                            htmlType='submit'
                                            shape='round'
                                            className='submit-button'>
                                            {t('home.apply')}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        ) : <NotFound />}
                    </div>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </>
    );
};