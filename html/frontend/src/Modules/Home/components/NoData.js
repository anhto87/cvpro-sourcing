import React from 'react';
import { Row, Typography, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';

const { Title, Text, Paragraph } = Typography;

export const NoData = () => {
    const { t } = useTranslation()
    return (
        <div className="pad24">
            <Row justify="center" align="top" gutter={10} wrap={false}>
                <Col>
                    <BsSearch size={20} />
                </Col>
                <Col>
                    <Title level={5}>{t('common.noDataTitle')}</Title>
                </Col>
            </Row>
            <div style={{ padding: '20px 50px 50px 50px' }}>
                <Text strong>{t('common.noDataTitleContent')}</Text>
                <Paragraph>
                    <ul>
                        <li>
                            <Text type="danger">{t('common.noDataReason1')}.</Text>
                        </li>
                        <li>
                            <Text type="danger">{t('common.noDataReason2')}</Text>
                        </li>
                        <li>
                            <Text type="danger">{t('common.noDataReason1')}</Text>
                        </li>
                    </ul>
                </Paragraph>
            </div>
        </div>
    );
}