/**
 * 页面 2：店铺健康度看板
 *
 * 展示各店铺销售、利润、广告效率、库存压力
 * 联动：点击店铺 -> 展开该店铺下 ASIN 列表
 */
import { useMemo, useState } from 'react';
import { Typography, Card, Row, Col, Table, Progress, Space } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import { HealthTag, LifecycleTag, WarningTag, GradeTag } from '../../components/StatusTag';
import { getStoreSummaries } from '../../services';
import { mockAsinMaster } from '../../mock-data';
import type { StoreSummary, AsinMaster } from '../../types';

export default function StoreHealthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStore = searchParams.get('store') || undefined;
  const [selectedStore, setSelectedStore] = useState<string | undefined>(initialStore);
  const stores = useMemo(() => getStoreSummaries(), []);

  const filteredStores = selectedStore
    ? stores.filter((s) => s.store_name === selectedStore)
    : stores;

  const storeAsins = selectedStore
    ? mockAsinMaster.filter((a) => a.store_name === selectedStore)
    : [];

  const storeColumns = [
    { title: '店铺', dataIndex: 'store_name', key: 'store_name' },
    {
      title: '健康度',
      dataIndex: 'health_tag',
      key: 'health_tag',
      render: (tag: StoreSummary['health_tag']) => <HealthTag tag={tag} />,
    },
    {
      title: '销售额',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (v: number) => `$${v.toLocaleString()}`,
      sorter: (a: StoreSummary, b: StoreSummary) => a.total_sales - b.total_sales,
    },
    {
      title: '利润',
      dataIndex: 'total_profit',
      key: 'total_profit',
      render: (v: number) => (
        <Typography.Text type={v < 0 ? 'danger' : 'success'}>
          ${v.toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: '利润率',
      dataIndex: 'profit_margin',
      key: 'profit_margin',
      render: (v: number) => <Progress percent={v} size="small" steps={5} />,
    },
    { title: 'ACOS', dataIndex: 'acos', key: 'acos', render: (v: number) => `${v}%` },
    { title: '新品', dataIndex: 'new_product_count', key: 'new_product_count' },
    { title: '稳定品', dataIndex: 'stable_count', key: 'stable_count' },
    {
      title: '风险品',
      dataIndex: 'risk_count',
      key: 'risk_count',
      render: (v: number) => (
        <Typography.Text type={v > 0 ? 'danger' : undefined}>{v}</Typography.Text>
      ),
    },
    {
      title: '库存金额',
      dataIndex: 'inventory_value',
      key: 'inventory_value',
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    { title: 'ASIN 总数', dataIndex: 'total_asin_count', key: 'total_asin_count' },
  ];

  const asinColumns = [
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      render: (asin: string) => (
        <a onClick={() => navigate(`/asin-lifecycle?asin=${asin}`)}>{asin}</a>
      ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 200 },
    { title: '负责人', dataIndex: 'owner', key: 'owner' },
    {
      title: '生命周期',
      dataIndex: 'lifecycle_stage',
      key: 'lifecycle_stage',
      render: (stage: AsinMaster['lifecycle_stage']) => <LifecycleTag stage={stage} />,
    },
    {
      title: '等级',
      dataIndex: 'stable_grade',
      key: 'stable_grade',
      render: (grade: AsinMaster['stable_grade']) => <GradeTag grade={grade} />,
    },
    {
      title: '风险',
      dataIndex: 'warning_level',
      key: 'warning_level',
      render: (level: AsinMaster['warning_level']) => <WarningTag level={level} />,
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        店铺健康度
      </Typography.Title>

      <PageFilter showStore showOwner onStoreChange={setSelectedStore} />

      <Card size="small" title="各店铺健康度">
        <Table
          dataSource={filteredStores}
          columns={storeColumns}
          rowKey="store_name"
          size="small"
          pagination={false}
          onRow={(record) => ({
            onClick: () => setSelectedStore(record.store_name),
            style: {
              cursor: 'pointer',
              background:
                record.store_name === selectedStore ? '#e6f4ff' : undefined,
            },
          })}
        />
      </Card>

      {selectedStore && (
        <Card
          size="small"
          title={
            <Space>
              <span>{selectedStore} - ASIN 列表</span>
              <a onClick={() => setSelectedStore(undefined)} style={{ fontSize: 12 }}>
                清除选择
              </a>
            </Space>
          }
          style={{ marginTop: 16 }}
        >
          <Row gutter={16} style={{ marginBottom: 12 }}>
            {(['新品期', '稳定期', '清货', '淘汰'] as const).map((stage) => {
              const count = storeAsins.filter((a) => a.lifecycle_stage === stage).length;
              return (
                <Col key={stage} span={6}>
                  <Card size="small">
                    <Typography.Text type="secondary">{stage}</Typography.Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>{count}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <Table
            dataSource={storeAsins}
            columns={asinColumns}
            rowKey="asin"
            size="small"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
}
