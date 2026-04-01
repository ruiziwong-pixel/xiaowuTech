/**
 * 主布局 - 左侧导航 + 顶栏 + 主内容区
 */
import { useState } from 'react';
import { Layout, Menu, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  TagsOutlined,
  FundOutlined,
  DatabaseOutlined,
  CheckSquareOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '经营总览' },
  { key: '/store-health', icon: <ShopOutlined />, label: '店铺健康度' },
  {
    key: '/asin-lifecycle',
    icon: <TagsOutlined />,
    label: 'ASIN 生命周期',
    children: [
      { key: '/asin-lifecycle', label: '总览' },
      { key: '/asin-lifecycle/new-product', icon: <RocketOutlined />, label: '新品识别' },
      { key: '/asin-lifecycle/stable-management', icon: <StarOutlined />, label: '稳定品管理' },
    ],
  },
  { key: '/ad-diagnosis', icon: <FundOutlined />, label: '广告诊断' },
  { key: '/inventory-health', icon: <DatabaseOutlined />, label: '库存健康' },
  { key: '/todo', icon: <CheckSquareOutlined />, label: '个人待办' },
];

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // 自动展开包含当前路径的子菜单
  const defaultOpenKeys = location.pathname.startsWith('/asin-lifecycle') ? ['/asin-lifecycle'] : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: token.colorBgContainer }}
        theme="light"
      >
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text strong style={{ fontSize: collapsed ? 14 : 16 }}>
            {collapsed ? 'AMZ' : 'AMZ 精铺运营'}
          </Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 48,
          }}
        >
          <Typography.Text type="secondary">
            数据更新时间：2026-03-31 08:00（Mock）
          </Typography.Text>
          <Typography.Text type="secondary">当前用户：张三 | A组</Typography.Text>
        </Header>
        <Content style={{ margin: 16, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
