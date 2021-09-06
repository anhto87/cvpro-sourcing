import './SearchForm.css';
import React from 'react';
import { Row, Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { GoLocation } from 'react-icons/go';
import { BsSearch } from 'react-icons/bs';
const INPUT_HEIGHT = 45;

export const SearchForm = ({ form, keyword, address, onPressSubmit, onChangeKeyword, onChangeAddress, fill }) => {
    const { t } = useTranslation();
    return (
        <>
            <Form size='large' form={form} name="search" style={{ width: fill ? '100%' : '72.5%' }}>
                <Row wrap={false} justify="space-around">
                    <Form.Item label={t('home.keyword')} labelCol={{ span: 24 }} name="keyword" className="input-item" style={{ width: '40%' }}>
                        <Input
                            value={keyword}
                            style={{ height: INPUT_HEIGHT }}
                            placeholder={t('home.keywordPlaceholder')}
                            onChange={e => onChangeKeyword(e.target.value)}
                            suffix={<BsSearch />}
                        />
                    </Form.Item>
                    <Form.Item label={t('home.address')} labelCol={{ span: 24 }} name="address" className="input-item" style={{ width: '40%' }}>
                        <Input
                            value={address}
                            style={{ height: INPUT_HEIGHT }}
                            placeholder={t('home.addressPlaceholder')}
                            suffix={<GoLocation />}
                            onChange={e => onChangeAddress(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item style={{ alignItems: 'flex-end', width: '20%' }}>
                        <Button
                            onClick={onPressSubmit}
                            type="primary"
                            htmlType="submit"
                            shape="round"
                            className="submit-button" style={{ width: '100%' }}>
                            {t('home.searchButton')}
                        </Button>
                    </Form.Item>
                </Row>
            </Form>
        </>
    )
};