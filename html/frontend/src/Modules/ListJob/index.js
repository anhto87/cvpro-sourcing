import './ListJob.css';
import React, { useEffect, useReducer, useState } from 'react';
import { useLocation, useHistory } from "react-router-dom";
import { Row, Col, Form, Layout, Typography } from 'antd';
import { useLocalStorage } from '../../global/hooks';
import {
    StorageSearchRecents,
    FilterTimes,
    FilterJobTypes,
    getJobDetailURL,
    LogoName,
    getListJobURL,
    getTopJobDetailURL,
    Types
} from '../../global/helpers';
import _ from 'lodash';
import { ListJobs } from './components/ListJobs';
import apis from '../../global/helpers/apis';
import { Filter } from './components/Filter';
import { reducer, initialValues } from './reducer';
import { jobsSuggestAction, loadCompletedAction, loading, resetAction, updateFormValues, updatePageAction } from './actions';
import { SearchForm } from '../../components/SearchForm';
import { ListJobSuggest } from './components/ListJobSuggest';
import logo from '../../assets/logo_3.svg';
const { Content, Footer } = Layout;

const init = (initial) => {
    return initial
}
export const ListJob = () => {
    const [form] = Form.useForm();
    const location = useLocation();
    const history = useHistory();
    const [locationKeys, setLocationKeys] = useState([])
    const [recents, setSearchRecents] = useLocalStorage(StorageSearchRecents, []);
    const [state, dispatch] = useReducer(reducer, initialValues, init);

    const updateForm = (payload) => dispatch(updateFormValues(payload));
    const updatePage = (payload) => dispatch(updatePageAction(payload));
    const loadCompleted = (payload) => dispatch(loadCompletedAction(payload));
    const fetchData = (isLoading) => dispatch(loading(isLoading));
    const reset = (isLoading) => dispatch(resetAction(isLoading));
    const setJobSuggest = (jobs) => dispatch(jobsSuggestAction(jobs));

    useEffect(() => {
        initData(location.search);
    }, [])

    useEffect(() => {
        return history.listen(location => {
            if (history.action === 'PUSH') {
                setLocationKeys([location.key])
            }

            if (history.action === 'POP') {
                if (locationKeys[1] === location.key) {
                    setLocationKeys(([_, ...keys]) => keys)
                    console.log("Forward", history.location)
                    initData(history.location.search);
                } else {
                    setLocationKeys((keys) => [location.key, ...keys])
                    console.log("Back", history.location)
                    initData(history.location.search);
                }
            }
        })
    }, [locationKeys,])

    const initData = (search) => {
        const query = new URLSearchParams(search);
        const keyword = query.get('keyword') || '';
        const address = query.get('address') || '';
        const time = parseInt(query.get('t')) || FilterTimes.all;
        const jobType = query.get('type') || FilterJobTypes.all;
        const page = parseInt(query.get('page')) || 1;
        form.setFieldsValue({ keyword, address });
        console.log({ keyword, address, time, jobType, page: page ? page : 1 })
        updateForm({ keyword, address, time, jobType, page: page ? page : 1 });

        apis.getJobsSuggest().then(response => {
            const jobs = Array.isArray(response?.jobs) ? response?.jobs : [];
            setJobSuggest(jobs)
        })
    }

    useEffect(() => {
        const form = state?.form;
        if (form && (typeof form?.keyword === 'string' || typeof form?.address === 'string')) {
            fetchData(true);
        }
    }, [state?.form?.page, state?.form?.time, state?.form?.jobType]);

    useEffect(() => {
        const isLoading = state?.isLoading || false;
        if (isLoading) {
            document.title = (state?.form?.keyword || '').length === 0 ? "Tất cả việc làm" : `Tuyển dụng, tìm việc làm ${state?.form?.keyword}`
            getListJobs().then(r => console.log(r));
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
        if (page !== 1) {
            updatePage(1);
        } else {
            fetchData(true);
        }
        updateURL(1);
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

        const res = await apis.getListJobs({ keyword, address, page, jobType, xLast })
        const totalJobs = res?.meta?.total || 0;
        const limit = res?.meta?.limit || 1;
        const totalPage = Math.ceil(totalJobs / limit);
        const jobs = res?.data || [];
        loadCompleted({ jobs, totalJobs, page, totalPage, limit });
    }

    const loadMore = (newPage) => {
        if (newPage !== state?.form?.page) {
            updatePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateURL(newPage);
        }
    }

    const updateURL = (page, newForm) => {
        const form = newForm ? newForm : state?.form;
        const jobType = form?.jobType;
        const xLast = form?.time;
        const keyword = form?.keyword || '';
        const address = form?.address || '';
        const url = getListJobURL({ keyword, address, page, jobType, time: xLast })
        history.push(url);
    }

    const onPressGoHome = () => {
        reset();
        form.setFieldsValue({ keyword: null, address: null });
        history.push('/')
    }

    const onPressLink = (item) => {
        let pathname = item.type === Types.top ? getTopJobDetailURL(item) : getJobDetailURL(item);
        history.push({ pathname, state: item });
    }

    const onPressTopJob = (item) => {
        let pathname = getTopJobDetailURL(item)
        history.push({ pathname, state: item });
    }

    const onFilter = (filter) => {
        updateForm(filter);
        updateURL(filter?.form?.page || 1, filter);
    }

    const suggests = Array.isArray(state?.jobsSuggest) ? state.jobsSuggest : [];

    return (
        <>
            <Row justify='space-between' align='middle' className="header">
                <Col className="logo-header">
                    <Typography.Link style={{ color: 'black' }} onClick={onPressGoHome}>
                        <img style={{ height: 19 }} src={logo} className="App-logo" alt="logo" />
                    </Typography.Link>
                </Col>
            </Row>
            <Content>
                <div className="content-container">
                    <SearchForm
                        form={form}
                        keyword={state?.form?.keyword || ''}
                        address={state?.form?.address || ''}
                        onChangeAddress={(e) => updateForm({ ...state.form, address: e })}
                        onChangeKeyword={(e) => updateForm({ ...state.form, keyword: e })}
                        onPressSubmit={onPressSubmit}
                    />
                </div>
                <div className="content-container">
                    <Row justify='start' align='top' gutter={30} wrap={false}>
                        <Col flex="21%">
                            <Filter
                                time={state?.form?.time || FilterTimes.all}
                                jobType={state?.form?.jobType || FilterJobTypes.all}
                                onChangeJobType={(jobType) => onFilter({ ...state.form, jobType })}
                                onChangeTime={(time) => onFilter({ ...state.form, time })}
                            />
                        </Col>
                        <Col flex="51.5%">
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
                        <Col flex="27.5%">
                            <ListJobSuggest items={suggests} onPressLink={onPressTopJob} />
                        </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </>
    )
};
