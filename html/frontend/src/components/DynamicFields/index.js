import React, { useContext } from 'react';
import { DynamicFieldsContext } from './context';
import { Col, Form, Input, Row, Select, Space, Typography, Upload } from 'antd';
import _ from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Title } = Typography;
export const RenderItemType = (props) => {
    const {field, t} = props;
    const {formState, dispatchFormState} = useContext(DynamicFieldsContext);
    const WrapFormItem = (props) => {
        return (
            <Form.Item labelAlign={formState.configLayout.labelAlight} label={field.label} name={field.name}>
                {props.children}
            </Form.Item>
        );
    }

    switch (field.type) {
        case 'input':
            const dataState = _.get(formState, _.get(field, 'baseDataKeyReducer', -1));

            if (
                (dataState !== undefined && dataState !== null && formState.currCountryCode === 'VN') &&
                _.get(field, 'futureType') == 'select'
            ) {
                const newFieldDefined = {
                    label: field.label,
                    name: field.name,
                    type: 'select.search',
                    dataKey: _.get(field, 'futureDataKeyReducer'),
                    placeholder: _.get(field, 'futurePlaceholder')
                };

                return (
                    <RenderItemType t={t} field={newFieldDefined}/>
                );
            } else {
                //formState.form.resetFields([field.name]);

                return (
                    <WrapFormItem>
                        <Input {..._.get(field, 'attribute', {})}/>
                    </WrapFormItem>
                );
            }
        case 'select':
            return (
                <WrapFormItem>
                    <Select {..._.get(field, 'attribute', {})}/>
                </WrapFormItem>
            );
        case 'file':
            return (
                <Form.Item
                    labelAlign={formState.configLayout.labelAlight}
                    label={field.label}
                    name={field.name}
                >
                    <Upload
                        {..._.get(field, 'attribute', {})}
                        onChange={(file) => {
                            dispatchFormState({
                                type: field.actionReducer.onChange,
                                file: file.file,
                            });
                        }}
                        fileList={formState.fileList}
                        disabled={
                            _.get(formState, 'file') !== null ? true : false
                        }
                    >
                        <Space>
                            <span style={{ cursor: 'pointer' }}>
                                {t('Browse files')}
                            </span>
                            <DeleteOutlined
                                onClick={() => {
                                    dispatchFormState({
                                        type: field.actionReducer.onRemove,
                                    });
                                }}
                            />
                        </Space>
                    </Upload>
                </Form.Item>
            );
        case 'select.search':
            return (
                <Form.Item
                    labelAlign={formState.configLayout.labelAlight}
                    label={field.label}
                    name={field.name}
                >
                    <Select
                        showSearch
                        placeholder={_.get(field, 'placeholder', '')}
                        options={_.get(formState, _.get(field, 'dataKey'))}
                        {..._.get(field, 'attribute', {})}
                        filterOption={(input, option) => {
                            const currLabel = _.lowerCase(_.get(option, 'label'));
                            return currLabel.indexOf(input) > -1 || _.get(option, 'label').indexOf(input) > -1;
                        }}
                        onSelect={(value) => {
                            if (_.get(field, 'updateDataKeyReducer', false)) {
                                dispatchFormState({type: field.updateDataKeyReducer, value: value});
                            }
                        }}
                    >
                    </Select>
                </Form.Item>
            );
        default:
            return null;
    }
};
export const RenderFields = ({form}) => {
    const { t, i18n } = useTranslation();
    const {formState} = useContext(DynamicFieldsContext);
        return (
            <>
                {formState.fieldGroups.map((group, groupKey) => {
                    return (
                        <React.Fragment key={`group-field-${groupKey}`}>
                            <Row style={{ marginTop: (groupKey !== 0 ? 26 : 0) }}>
                                <Col span={24}>
                                    <Title
                                        style={{ marginBottom: 20 }}
                                        level={formState.configLayout.levelSubHeading}
                                    >
                                        {t(_.get(group, 'title'))}
                                    </Title>
                                </Col>
                            </Row>
                            <Row>
                            {_.get(group, 'cols').map((item, colsKey) => {
                                return (
                                    <React.Fragment
                                        key={`group-cols-${colsKey}`}
                                    >
                                        {_.get(item, 'fields', []).map(
                                            (field, fieldKey) => {
                                                return (
                                                    <Col
                                                        key={`group-field-${fieldKey}`}
                                                        span={12}
                                                        className="gutter-row"
                                                    >
                                                        <RenderItemType t={t} field={field}/>
                                                    </Col>
                                                );
                                            }
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            </Row>
                        </React.Fragment>
                    );
                })}
            </>
        );
    };
