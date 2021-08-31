import React from 'react';
import PropTypes from 'prop-types';
import { List, Skeleton, Divider, Typography, Row, Col, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '../../../global/helpers';
import { BsBookmark } from 'react-icons/bs';
import { NoData } from './NoData';
const { Text, Paragraph, Link } = Typography;

export const ListJobs = ({ items, isLoading, page, totalPage, totalJob, loadMore, limit }) => {
    const { t } = useTranslation()
    const emptys = [0, 1, 2, 3, 4, 5];

    if (!isLoading && Array.isArray(items) && items.length === 0) {
        return <NoData />
    }
    return (
        <>
            <Row>
                <Paragraph className="font15">
                    <Text className="font17" strong>{totalJob}</Text>
                    {` ${t('home.totalJob')} `}
                    <Text className="font17" strong>{page}</Text>
                    {` ${t('home.of')} `}
                    <Text className="font17" strong>{totalPage}</Text>
                </Paragraph>
            </Row>
            <Divider className="mar0" />
            <List
                className="marB50"
                itemLayout="vertical"
                size="large"
                dataSource={isLoading ? emptys : items}
                pagination={{
                    position: 'bottom',
                    total: totalJob,
                    current: page,
                    pageSize: limit || 20,
                    style: { textAlign: 'center' },
                    onChange: loadMore,
                    showSizeChanger: false
                }}
                renderItem={(item) => {
                    const addtions = [];
                    if (item.jobType && item.jobType.length > 0) { addtions.push(`${t('home.jobType')}: ${item.jobType}`) }
                    if (item.experience && item.experience.length > 0) { addtions.push(`${t('home.experience')}: ${item.experience}`) }
                    return (
                        <Skeleton key={item?._id} loading={isLoading} active>
                            <List.Item key={item?._id} className="padHorizontal0">
                                <Row justify="space-between" align="top" wrap={false} gutter={5}>
                                    <Col>
                                        <Link level={5} className="job-link"> {item?.jobTitle || ''}</Link>
                                        <div>
                                            <Text className="fontW600">
                                                {item?.company || ''}
                                                <Text className="fontW400">
                                                    {Array.isArray(item?.locations) && item.locations.length > 0 && `  -  ${item.locations.map(ele => ele.trim()).join(', ')}`}
                                                </Text>
                                            </Text>
                                        </div>
                                        {Array.isArray(item?.skills) && item.skills.length > 0 &&
                                            <Row wrap={false} style={{ paddingRight: 50 }}>
                                                <Paragraph ellipsis={{ rows: 1, expandable: false }} style={{ marginBottom: 0 }}>
                                                    {t('home.skill')}
                                                    <Text>{item.skills.map(ele => ele.trim()).join(', ')}.</Text>
                                                </Paragraph>
                                            </Row>
                                        }
                                        <Row justify="space-between" wrap={false}>
                                            {addtions.length > 0 && <Text>{addtions.join(' - ')}</Text>}
                                        </Row>
                                    </Col>
                                    <Col>
                                        <div className="font13" style={{ padding: '2px 10px', backgroundColor: '#2979c4', color: 'white', borderRadius: 2 }}>
                                            {t('home.new')}
                                        </div>
                                    </Col>
                                </Row>

                                <Row justify="space-between" wrap={false}>
                                    <Text>{timeAgo(item.onlineDate)}</Text>
                                    {/* <Button shape="round" icon={<BsBookmark style={{ verticalAlign: 'middle', marginRight: 5 }} />}>
                                            {t('home.save')}
                                        </Button> */}
                                </Row>
                            </List.Item>
                        </Skeleton>
                    )
                }}
            />
        </>
    )
}


ListJobs.propTypes = {
    items: PropTypes.any,
    isLoading: PropTypes.bool,
    page: PropTypes.number,
    totalPage: PropTypes.number,
    totalJob: PropTypes.number,
    loadMore: PropTypes.func,
    limit: PropTypes.number
}