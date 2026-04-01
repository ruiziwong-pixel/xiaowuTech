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

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // 自动展开包含当前路径的子菜单
  const currentOpenKeys = location.pathname.startsWith('/asin-lifecycle')
    ? ['asin-lifecycle-menu']
    : [];
  const mergedOpenKeys = [...new Set([...openKeys, ...currentOpenKeys])];

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
          openKeys={mergedOpenKeys}
          onOpenChange={setOpenKeys}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        >
          <Menu.Item key="/" icon={<DashboardOutlined />}>
            经营总览
          </Menu.Item>
          <Menu.Item key="/store-health" icon={<ShopOutlined />}>
            店铺健康度
          </Menu.Item>
          <Menu.SubMenu
            key="asin-lifecycle-menu"
            icon={<TagsOutlined />}
            title="ASIN 生命周期"
          >
            <Menu.Item key="/asin-lifecycle">总览</Menu.Item>
            <Menu.Item key="/asin-lifecycle/new-product" icon={<RocketOutlined />}>
              新品识别
            </Menu.Item>
            <Menu.Item key="/asin-lifecycle/stable-management" icon={<StarOutlined />}>
              稳定品管理
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="/ad-diagnosis" icon={<FundOutlined />}>
            广告诊断
          </Menu.Item>
          <Menu.Item key="/inventory-health" icon={<DatabaseOutlined />}>
            库存健康
          </Menu.Item>
          <Menu.Item key="/todo" icon={<CheckSquareOutlined />}>
            个人待办
          </Menu.Item>
        </Menu>
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
