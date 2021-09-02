import React, { useContext, useEffect, useState } from 'react';
import {
    Upload,
    Button,
    Form,
    Layout,
    Row,
    Col,
    Input,
    Select,
    Typography,
    Space
} from 'antd';
import _ from 'lodash';
import { axiosRequest } from '@src/global/utils';
import { useTranslation } from 'react-i18next';
import BlockWrapper from '@src/components/BlockWrapper';

import {DynamicFieldsProvider,DynamicFieldsContext} from '@src/components/DynamicFields/context';
import {RenderFields} from '@src/components/DynamicFields/index';
const { Content } = Layout;
const { Title } = Typography;

export const fieldGroups = [
    {
        title: 'Basic Info',
        cols: [
            {
                fields: [
                    {
                        label: 'Email',
                        name: 'email',
                        type: 'input',
                    },
                    {
                        label: 'Phone',
                        name: 'phone',
                        type: 'input',
                    },
                ],
            },
            {
                fields: [
                    {
                        label: 'Full name',
                        name: 'fullname',
                        type: 'input',
                    },
                ],
            },
        ],
    },
    {
        title: 'Addresses Information',
        cols: [
            {
                fields: [
                    {
                        label: 'Country',
                        name: 'country',
                        type: 'select.search',
                        dataKey: 'countries',
                        placeholder: 'Type for search country',
                        updateDataKeyReducer: 'UPDATE_CURR_COUNTRY'
                    },
                    {
                        label: 'City',
                        name: 'city',
                        type: 'input',
                        futureType: 'select',
                        futureDataKeyReducer: 'cities',
                        futurePlaceholder: 'Type for search city',
                        baseDataKeyReducer: 'currCountryCode' // that mean state is changed then this field will be update
                    },
                ],
            },
            {
                fields: [
                    {
                        label: 'State/Province',
                        name: 'state',
                        type: 'input',
                    },
                ],
            },
        ],
    },
    {
        title: 'Professional Details',
        cols: [
            {
                fields: [
                    {
                        label: 'Experience in Years',
                        name: 'exp',
                        type: 'select',
                    },
                ],
            },
        ],
    },
    {
        title: 'Attachment',
        cols: [
            {
                fields: [
                    {
                        label: 'Resume/CV',
                        name: 'file',
                        type: 'file',
                        actionReducer: {
                            onChange: 'HANDLER_UPLOAD_FILE',
                            onRemove: 'HANDLER_CLEAR_FILE'
                        },
                        attribute: {
                            beforeUpload: function() {
                                return false;
                            },
                            maxCount: 1
                        }
                    },
                ],
            },
        ],
    },
];

export const Head = (props) => {
    const {form} = props;
    const { t } = useTranslation();
    const {formState, dispatchFormState} = React.useContext(DynamicFieldsContext);
    return (
        <Content style={{ height: '60px', flex: 'none', padding: '20px 16px' }}>
            <Row>
                <Col span={8}>
                    <Title level={3}>{t('Submit Candidate')}</Title>
                </Col>
                <Col span={8} offset={8}>
                    <Space style={{ float: 'right' }}>
                        <Button
                            loading={_.get(formState, 'isSubmitting')}
                            type="primary"
                            onClick={async () => {
                                const formData = form.getFieldsValue();
                                console.log(`formData`, formData);
                                console.log(`formState`, formState);
                                const data = new FormData();

                                _.each(Object.keys(formData), (field) => {
                                    if (field == 'file') {
                                        const file = _.get(formData, `${field}.file`);
                                        if (file !== undefined) {
                                            data.append(field, file);
                                        }
                                    } else if(_.get(formData, field, false)) {
                                        data.append(field, _.get(formData, field));
                                    }
                                });

                                const response = await axiosRequest('/candidates/jobs/apply', {
                                    method: 'POST',
                                    body: data,
                                    access_token: true,
                                });
                            }}
                            htmlType={'submit'}
                        >
                            {t('Save')}
                        </Button>
                        <Button
                            disabled={_.get(formState, 'isSubmitting')}
                        >
                            {t('Cancel')}
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Content>
    );
}

export const MainBlock = (props) => {
    const {form} = props;
    const {dispatchFormState} = useContext(DynamicFieldsContext);
    useEffect(() => {
        dispatchFormState({type: 'SET_INIT_FORM', form:form, fieldGroups: fieldGroups});
    }, []);
    return (
        <BlockWrapper>
            <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 15 }}
                colon={false}
            >
                <RenderFields form={form}/>
            </Form>
        </BlockWrapper>
    );
}

export const CandidateSubmitForm = (props) => {
    const [currFile, setCurrFile] = useState();
    const [form] = Form.useForm();

    return (
        <DynamicFieldsProvider>
            <Layout>
                <Head form={form}/>
                <MainBlock form={form}/>
            </Layout>
        </DynamicFieldsProvider>
    );
};
