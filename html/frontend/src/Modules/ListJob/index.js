import './ListJob.css';
import React, { useEffect, useReducer } from 'react';
import { useLocation, useHistory } from "react-router-dom";
import { Row, Col, Button, Form, Input, Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { GoLocation } from 'react-icons/go';
import { BsSearch } from 'react-icons/bs';
import { useLocalStorage } from '../../global/hooks';
import { StorageSearchRecents, FilterTimes, FilterJobTypes, getJobDetailURL, LogoName } from '../../global/helpers';
import _ from 'lodash';
import { ListJobs } from './components/ListJobs';
import apis from '../../global/helpers/apis';
import { Filter } from './components/Filter';
import { reducer, initialValues } from './reducer';
import { loadCompletedAction, loading, resetAction, updateFormValues, updatePageAction } from './actions';
import { SearchForm } from '../../components/SearchForm';
const { Content, Footer } = Layout;
const INPUT_HEIGHT = 45;

export const ListJob = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const location = useLocation();
    const history = useHistory();
    const [recents, setSearchRecents] = useLocalStorage(StorageSearchRecents, []);
    const [state, dispatch] = useReducer(reducer, initialValues);
    const query = new URLSearchParams(location.search);

    const updateForm = (payload) => dispatch(updateFormValues(payload));
    const updatePage = (payload) => dispatch(updatePageAction(payload));
    const loadCompleted = (payload) => dispatch(loadCompletedAction(payload));
    const showLoading = (isLoading) => dispatch(loading(isLoading));
    const reset = (isLoading) => dispatch(resetAction(isLoading));

    useEffect(() => {
        const keyword = query.get('keyword') || '';
        const address = query.get('address') || '';
        const time = parseInt(query.get('t')) || FilterTimes.all;
        const jobType = query.get('type') || FilterJobTypes.all;
        const page = parseInt(query.get('page')) || 1;
        form.setFieldsValue({ keyword, address });
        updateForm({ keyword, address, time, jobType, page });
    }, [])

    useEffect(() => {
        const form = state?.form;
        if (form && (typeof form?.keyword === 'string' || typeof form?.address === 'string')) {
            showLoading(true);
        }
    }, [state?.form?.page, state?.form?.time, state?.form?.jobType]);

    useEffect(() => {
        const isLoading = state?.isLoading || false;
        if (isLoading) {
            getListJobs()
        }
    }, [state?.isLoading])

    const onPressSubmit = () => {
        const keyword = state?.form?.keyword || '';
        const address = state?.form?.address || '';
        if (keyword.length > 0 || address.length > 0) {
            addRecents({ keyword, address });
        }
        const page = state?.form?.page || 1;
        updateForm({ ...state.form, keyword, address });
        if (page != 1) {
            updatePage(1);
        } else {
            showLoading(true);
        }
    }

    const addRecents = (value) => {
        let items = Array.isArray(recents) ? recents : [];
        if (!_.find(items, value)) {
            if (items.length > 2) {
                items = _.dropRight(items);
            }
            items = [value, ...items];
            setSearchRecents(items);
        }
    }

    const getListJobs = async () => {
        const form = state.form;
        const jobType = form.jobType === FilterJobTypes.all ? '' : form.jobType;
        const xLast = form.time === FilterTimes.all ? '' : form.time;
        const keyword = form.keyword;
        const address = form.address;
        const page = form?.page || 1;

        updateURL();
        const res = await apis.getListJobs({ keyword, address, page, jobType, xLast })
        const totalJobs = res?.meta?.total || 0;
        const limit = res?.meta?.limit || 1;
        const totalPage = Math.ceil(totalJobs / limit);
        const jobs = res?.data || [];
        loadCompleted({ jobs, totalJobs, page, totalPage, limit });
    }

    const loadMore = (newPage) => {
        if (newPage != state?.form?.page) {
            updatePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const updateURL = () => {
        const form = state?.form;
        const jobType = form.jobType;
        const xLast = form.time;
        const keyword = form.keyword || '';
        const address = form.address || '';
        const page = form?.page || 1;
        let querys = { keyword, address };
        if (xLast && xLast !== FilterTimes.all) {
            querys['t'] = xLast;
        }
        if (jobType && jobType !== FilterJobTypes.all) {
            querys['type'] = jobType;
        }
        if (page !== 1) {
            querys['page'] = page;
        }
        let searchParams = new URLSearchParams(querys).toString();
        history.replace(`/tim-viec?${searchParams}`);
    }

    const onPressGoHome = () => {
        reset();
        form.setFieldsValue({ keyword: null, address: null });
        history.push('/')
    }

    const onPressLink = (item) => {
        let pathname = getJobDetailURL({ jobId: item._id })
        history.push({ pathname, state: item });
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
                    <div className="content">
                        <SearchForm
                            form={form}
                            keyword={state?.form?.keyword || ''}
                            address={state?.form?.address || ''}
                            onChangeAddress={(e) => updateForm({ ...state.form, address: e })}
                            onChangeKeyword={(e) => updateForm({ ...state.form, keyword: e })}
                            onPressSubmit={onPressSubmit}
                        />
                        <Row wrap={false}>
                            <Col flex="300px" className="left-content">
                                <Filter
                                    time={state?.form?.time || FilterTimes.all}
                                    jobType={state?.form?.jobType || FilterJobTypes.all}
                                    onChangeJobType={(jobType) => updateForm({ ...state.form, jobType })}
                                    onChangeTime={(time) => updateForm({ ...state.form, time })}
                                />
                            </Col>
                            <Col flex="auto">
                                <ListJobs
                                    isLoading={state?.isLoading || false}
                                    items={state?.jobs}
                                    page={state?.form?.page || 1}
                                    totalJob={state?.totalJobs || 0}
                                    totalPage={state?.totalPage || 0}
                                    loadMore={loadMore}
                                    limit={state?.limit || 0}
                                    onPressLink={onPressLink}
                                />
                            </Col>
                        </Row>
                    </div>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </>
    )
};