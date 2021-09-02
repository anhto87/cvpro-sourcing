import React, { useState } from 'react';
import { Card, Form, Input, Button, Divider, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { GlobalContext } from '../../global/context';
import { Redirect, useHistory } from 'react-router-dom';
import { fetchApi, formHasErrors } from '../../global/utils';
import _ from 'lodash';
import { UPDATE_LOGGED } from '../../global/reducer/auth.actions';

export const Login = (props) => {
    const { stateAuth, dispatchAuth } = useContext(GlobalContext);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [email, setEmail] = useState();
    const [passwd, setPasswd] = useState();
    const [form] = Form.useForm();
    const controller = new AbortController();
    const history = useHistory();

    if (stateAuth.authenticated) {
        return <Redirect to={`/`} />;
    }

    const onChangeInputAccount = (e) => {
        const currEmail = e.target.value;

        if (!_.isEmpty(currEmail)) {
            setEmail(currEmail);
        }
    };

    const onChangeInputPassword = (e) => {
        const currPassword = e.target.value;

        if (!_.isEmpty(currPassword)) {
            setPasswd(currPassword);
        }
    };

    const onLogin = (e) => {
        (async () => {
            if (!formHasErrors(form)) {
                setSubmitLoading(true);
                const response = await fetchApi('/users/login', {
                    method: 'POST',
                    signal: controller.signal,
                    body: JSON.stringify({
                        email: email,
                        password: passwd,
                    }),
                });

                setSubmitLoading(false);

                // dispatch to global state, store this token
                if (!_.isEmpty(_.get(response, 'token'))) {
                    dispatchAuth({
                        type: UPDATE_LOGGED,
                        token: _.get(response, 'token'),
                    });

                    message.success('Đăng nhập thành công.');
                    history.push('/');
                }
            }
        })();
    };

    return (
        <>
            <div style={{ marginBottom: 60 }}></div>
            <Row>
                <Col span={6} offset={9}>
                    <Card>
                        <Divider>

                        </Divider>
                        <Form
                            form={form}
                            name="horizontal_login"
                            layout="vertical"
                            initialValues={{ remember: true }}
                            onSubmit={() => {}}
                        >
                            <Form.Item
                                name="email"
                                hasFeedback // Hiển thị feedback validate qua icon
                                help={false} // Không hiển thị message lỗi
                                rules={[
                                    {
                                        type: 'email',
                                    },
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <UserOutlined className="site-form-item-icon" />
                                    }
                                    placeholder="Email"
                                    onBlur={(e) => {
                                        onChangeInputAccount(e);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                hasFeedback // Hiển thị feedback validate qua icon
                                help={false} // Không hiển thị message lỗi
                                rules={[
                                    {
                                        type: 'string',
                                        required: true,
                                        min: 3,
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <LockOutlined className="site-form-item-icon" />
                                    }
                                    type="password"
                                    placeholder="Password"
                                    onBlur={(e) => {
                                        onChangeInputPassword(e);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item shouldUpdate>
                                {() => (
                                    <Button
                                        style={{ width: '100%' }}
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitLoading}
                                        onClick={(e) => {
                                            onLogin(e);
                                        }}
                                        disabled={formHasErrors(form)}
                                    >
                                        ĐĂNG NHẬP
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </>
    );
};
