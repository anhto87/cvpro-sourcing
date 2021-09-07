import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Row, Tooltip, Divider, Typography, Col, Button } from 'antd';
import {
    FilterJobTypes,
    FilterTimes,
    FILTER_TYPE_JOBTYPE,
    FILTER_TYPE_TIME
} from '../../../global/helpers';
import { useTranslation } from 'react-i18next';

export const Filter = ({ time, jobType, onChangeTime, onChangeJobType }) => {

    const { t } = useTranslation();
    const items = [
        {
            title: t('home.jobType'),
            type: FILTER_TYPE_JOBTYPE,
            options: [
                FilterJobTypes.all,
                FilterJobTypes.fullTime,
                FilterJobTypes.permanent,
                FilterJobTypes.internship,
                FilterJobTypes.partTime,
                FilterJobTypes.online,
                FilterJobTypes.other
            ]
        },
        {
            title: t('home.publishDate'),
            type: FILTER_TYPE_TIME,
            options: [
                FilterTimes.all,
                FilterTimes.oneDay,
                FilterTimes.sevenDay,
                FilterTimes.fourteenDay,
                FilterTimes.thirtyDay,
            ]
        }
    ]

    const getTitleOptionFilterTime = (key) => {
        switch (key) {
            case FilterTimes.all:
                return t('home.allTime')
            case FilterTimes.oneDay:
                return t('home.hour', { val: 24 })
            case FilterTimes.sevenDay:
            case FilterTimes.fourteenDay:
            case FilterTimes.thirtyDay:
                return t('home.day', { val: key })
            default:
                return null;
        }
    }

    const getTitleOptionFilterJobTypes = (key) => {
        switch (key) {
            case FilterJobTypes.all:
                return t('home.allJob')
            case FilterJobTypes.fullTime:
                return t('home.fullTime')
            case FilterJobTypes.permanent:
                return t('home.permanent')
            case FilterJobTypes.internship:
                return t('home.internship')
            case FilterJobTypes.partTime:
                return t('home.partTime')
            case FilterJobTypes.online:
                return t('home.online')
            case FilterJobTypes.other:
                return t('home.other')
            default:
                return null;
        }
    }

    return (
        <div className="border borderRadius5" style={{ marginTop: 41 }}>
            {/* <div style={{ paddingTop: 34 }}>
                <Row gutter={16} className="pad20" style={{ paddingBottom: 0 }}>
                    <Col>
                        <Tooltip visible={true} placement="topLeft" title="Chức năng mới" color="#ff9728">
                            <Typography.Text strong>
                                Nộp đơn nhanh
                            </Typography.Text>
                        </Tooltip>
                    </Col>
                    <Col>
                        <Switch defaultChecked />
                    </Col>
                </Row>
                <Divider />
            </div> */}
            {
                items.map((ele, index) => {
                    return <div key={ele.title} style={{ paddingTop: index === 0 ? 24 : 0 }}>
                        <div style={{ paddingLeft: 20, paddingRight: 20 }}>
                            <Typography.Text strong >
                                {ele.title}
                            </Typography.Text>
                        </div>
                        <Row
                            gutter={[10, 10]}
                            style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 15, paddingBottom: index !== (items.length - 1) ? 6 : 30 }}
                            justify="start"
                        >
                            {
                                ele.options.map((option, index) => {
                                    const isJobType = ele.type === FILTER_TYPE_JOBTYPE;
                                    const isActive = isJobType ? jobType === option : time === option;
                                    const optionName = isJobType ? getTitleOptionFilterJobTypes(option) : getTitleOptionFilterTime(option);
                                    return (<Col key={option}>
                                        <Button className={isActive ? "btn-custom-focus" : "btn-custom"} danger={isActive} shape="round" onClick={(e) => {
                                            isJobType ? onChangeJobType(option) : onChangeTime(option);
                                        }}>
                                            {optionName}
                                        </Button>
                                    </Col>)
                                })
                            }
                        </Row>
                        {index !== (items.length - 1) ? <Divider /> : null}
                    </div>
                })
            }
        </div >
    );
}

Filter.propTypes = {
    time: PropTypes.number,
    jobType: PropTypes.string,
    onChangeJobType: PropTypes.func,
    onChangeTime: PropTypes.func
}