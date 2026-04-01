/**
 * 页面 1：经营总览看板
 *
 * 展示全局核心指标 + 风险摘要 + 建议动作
 * 联动：点击风险 ASIN 数 -> 跳转 ASIN 生命周期看板
 *       点击店铺摘要 -> 跳转店铺健康度
 */
import { useMemo } from 'react';
import { Row, Col, Card, List, Typography, Alert, Table } from 'antd';
import {
  DollarOutlined,
  WarningOutlined,
  ShoppingOutlined,
  FundOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/StatCard';
import { HealthTag } from '../../components/StatusTag';
import { getOverviewSummary, getStoreSummaries } from '../../services';
import { getAllTasks } from '../../task-center';
import type { StoreSummary } from '../../types';

export default function OverviewPage() {
  const navigate = useNavigate();
  const summary = useMemo(() => getOverviewSummary(), []);
  const stores = useMemo(() => getStoreSummaries(), []);
  const tasks = useMemo(() => getAllTasks(), []);
  const pendingTasks = tasks.filter((t) => t.status === '待处理' || t.status === '逾期');

  const storeColumns = [
    {
      title: '店铺',
      dataIndex: 'store_name',
      key: 'store_name',
      render: (name: string) => (
        <a onClick={() => navigate(`/store-health?store=${name}`)}>{name}</a>
      ),
    },
    {
      title: '销售额',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: '利润率',
      dataIndex: 'profit_margin',
      key: 'profit_margin',
      render: (v: number) => `${v}%`,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      key: 'acos',
      render: (v: number) => `${v}%`,
    },
    {
      title: '风险 ASIN',
      dataIndex: 'risk_count',
      key: 'risk_count',
      render: (v: number) => (
        <Typography.Text type={v > 0 ? 'danger' : undefined}>{v}</Typography.Text>
      ),
    },
    {
      title: '健康度',
      dataIndex: 'health_tag',
      key: 'health_tag',
      render: (tag: StoreSummary['health_tag']) => <HealthTag tag={tag} />,
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        经营总览
      </Typography.Title>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="总销售额"
            value={summary.total_sales}
            prefix={<DollarOutlined />}
            precision={2}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="总利润"
            value={summary.total_profit}
            prefix={<DollarOutlined />}
            precision={2}
            valueStyle={{ color: summary.total_profit > 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="广告花费"
            value={summary.total_ad_cost}
            prefix={<FundOutlined />}
            precision={2}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="库存金额"
            value={summary.total_inventory_value}
            prefix={<DatabaseOutlined />}
            precision={0}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="风险 ASIN"
            value={summary.risk_asin_count}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#cf1322' }}
            suffix={`/ ${summary.total_asin_count}`}
            onClick={() => navigate('/asin-lifecycle?warning=risk')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <StatCard
            title="待办任务"
            value={pendingTasks.length}
            prefix={<ShoppingOutlined />}
            valueStyle={{ color: '#1677ff' }}
            onClick={() => navigate('/todo')}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 店铺摘要 */}
        <Col xs={24} lg={14}>
          <Card title="店铺摘要" size="small">
            <Table
              dataSource={stores}
              columns={storeColumns}
              rowKey="store_name"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        {/* 右侧：本周问题 + 建议动作 */}
        <Col xs={24} lg={10}>
          <Card title="本周重点问题" size="small" style={{ marginBottom: 16 }}>
            <List
              size="small"
              dataSource={summary.weekly_issues}
              renderItem={(item) => (
                <List.Item>
                  <Alert message={item} type="warning" showIcon style={{ width: '100%' }} banner />
                </List.Item>
              )}
            />
          </Card>
          <Card title="建议动作" size="small">
            <List
              size="small"
              dataSource={summary.suggested_actions}
              renderItem={(item, i) => (
                <List.Item>
                  <Typography.Text>
                    {i + 1}. {item}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
