import React, { useContext } from 'react';
import { Layout, Menu } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    FileOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { GlobalContext } from '../context';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export const Layout1 = (props) => {
    const {} = useContext(GlobalContext);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header">
                <div className="logo">

                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                >
                    <Menu.Item key="1">Jobs Working</Menu.Item>
                    <Menu.Item key="2">Candidates</Menu.Item>
                    <Menu.Item key="3">Interviews</Menu.Item>
                    <Menu.Item key="4">Partner</Menu.Item>
                </Menu>
            </Header>
            <Layout className="site-layout">
                {/*<Sider theme="light" collapsed={false}>*/}
                {/*    <div className="logo" style={{ height: 60 }} />*/}
                {/*    <Menu defaultSelectedKeys={['1']} mode="inline">*/}
                {/*        <Menu.Item key="1" icon={<PieChartOutlined />}>*/}
                {/*            Option 1*/}
                {/*        </Menu.Item>*/}
                {/*        <Menu.Item key="2" icon={<DesktopOutlined />}>*/}
                {/*            Option 2*/}
                {/*        </Menu.Item>*/}
                {/*        <SubMenu*/}
                {/*            key="sub1"*/}
                {/*            icon={<UserOutlined />}*/}
                {/*            title="User"*/}
                {/*        >*/}
                {/*            <Menu.Item key="3">Tom</Menu.Item>*/}
                {/*            <Menu.Item key="4">Bill</Menu.Item>*/}
                {/*            <Menu.Item key="5">Alex</Menu.Item>*/}
                {/*        </SubMenu>*/}
                {/*        <SubMenu*/}
                {/*            key="sub2"*/}
                {/*            icon={<TeamOutlined />}*/}
                {/*            title="Team"*/}
                {/*        >*/}
                {/*            <Menu.Item key="6">Team 1</Menu.Item>*/}
                {/*            <Menu.Item key="8">Team 2</Menu.Item>*/}
                {/*        </SubMenu>*/}
                {/*        <Menu.Item key="9" icon={<FileOutlined />}>*/}
                {/*            Files*/}
                {/*        </Menu.Item>*/}
                {/*    </Menu>*/}
                {/*</Sider>*/}
                {props.children}
                <Footer style={{ textAlign: 'center' }}></Footer>
            </Layout>
        </Layout>
    );
};
