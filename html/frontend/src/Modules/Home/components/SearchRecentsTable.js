import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';
import { useTranslation } from 'react-i18next';

export const SearchRecentsTable = ({ items, onPressDelete, onPressItem, display }) => {
    const { t } = useTranslation()

    if (display && Array.isArray(items) && items.length > 0) {
        return (
            <div className="border marB50 borderRadius5 width100P">
                <Row justify='space-between' align='middle' className="pad-text font-bold font17">
                    <div>{t('home.searchRecents')}</div>
                    <Button shape='round' style={{ backgroundColor: '#f7f7f7' }} type="text" danger onClick={onPressDelete}>{t('home.delete')}</Button>
                </Row>
                {
                    items.map((ele, index) => {
                        return <Row key={index} justify="space-between" align='middle' className="pad-text">
                            <Button
                                type="link"
                                className="link"
                                style={{ color: 'black', padding: 0, margin: 0 }}
                                danger
                                onClick={() => onPressItem ? onPressItem(ele) : null}>{ele?.keyword || ''}</Button>
                        </Row>
                    })
                }
            </div>
        )
    }
    return null;
}

SearchRecentsTable.propTypes = {
    items: PropTypes.array,
    onPressDelete: PropTypes.func,
    onPressItem: PropTypes.func,
    display: PropTypes.bool
}