import './home.css';
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Row, Button, Form, Layout, Typography, Col } from 'antd';
import { useLocalStorage, useTotalJobs } from '../../global/hooks';
import { getListJobURL, LogoName, StorageSearchRecents } from '../../global/helpers';
import _ from 'lodash';
import { SearchRecentsTable } from './components/SearchRecentsTable';
import { SearchForm } from '../../components/SearchForm';
const { Content, Footer } = Layout;

export const Home = () => {
    const [form] = Form.useForm();
    const [keyword, setKeyword] = useState('');
    const [address, setAddress] = useState('');
    const history = useHistory();
    const totalJob = useTotalJobs();
    const [recents, setSearchRecents] = useLocalStorage(StorageSearchRecents, []);

    useEffect(() => {
        document.title = LogoName
    }, [])

    const onPressSubmit = () => {
        if (keyword.length > 0 || address.length > 0) {
            addRecents({ keyword, address });
        }
        gotoListJob({ keyword, address });
    }

    const gotoListJob = (params) => {
        let url = getListJobURL(params);
        history.push(url)
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

    const onPressGoHome = () => {
        history.push('/')
    }

    const TotalJobWaiting = ({ display, total }) => {
        return display && total > 0 ? <Row justify='center' align='top'>
            <Button
                color='black'
                className="linka total-job"
                type="link">
                <a>
                    Tìm <span style={{ fontWeight: 'bold' }}>{total}</span> việc bây giờ
                </a>
            </Button>
        </Row> : null;
    }

    return (
        <>
            <Content>
                <div className="content-container">
                    <Row justify='center' align='top' style={{ marginTop: 180 }}>
                        <Col span={18}>
                            <Row justify='start' className="logo-container">
                                <Typography.Link style={{ color: 'black' }} onClick={onPressGoHome}>{LogoName}</Typography.Link>
                            </Row>
                            <SearchForm
                                fill
                                form={form}
                                keyword={keyword}
                                address={address}
                                onChangeKeyword={e => setKeyword(e)}
                                onChangeAddress={e => setAddress(e)}
                                onPressSubmit={onPressSubmit}
                            />
                            <TotalJobWaiting display={true} total={totalJob} />
                            <SearchRecentsTable
                                display={true}
                                items={recents}
                                onPressItem={(item) => {
                                    const recentKeyword = item?.keyword || '';
                                    const recentAddress = item?.address || '';
                                    gotoListJob({ keyword: recentKeyword, address: recentAddress })
                                }}
                                onPressDelete={() => setSearchRecents([])}
                            />
                        </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </>
    )
};