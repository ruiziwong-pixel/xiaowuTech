/**
 * 页面 5：库存健康看板
 *
 * 展示库存状态分布 + 详细列表 + 补货/清货建议
 * 联动：可生成补货/清货任务 -> 任务中心
 */
import { useMemo, useState } from 'react';
import { Typography, Table, Card, Row, Col, Tag, Button, Modal, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import { ReplenishTagComp } from '../../components/StatusTag';
import { getInventoryHealthList } from '../../services';
import { createTask } from '../../task-center';
import type { InventoryHealthItem, InventoryStatus } from '../../types';

const statusColors: Record<InventoryStatus, string> = {
  '断货预警': 'red',
  '高库存低动销': 'orange',
  '高库存负利润': 'volcano',
  '健康库存': 'green',
  '清货候选': 'gold',
  '禁补候选': 'purple',
};

export default function InventoryHealthPage() {
  const [searchParams] = useSearchParams();
  const filterAsin = searchParams.get('asin');
  const [storeFilter, setStoreFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<InventoryStatus>();

  const allItems = useMemo(() => getInventoryHealthList(), []);

  let data = allItems;
  if (filterAsin) data = data.filter((d) => d.asin === filterAsin);
  if (storeFilter) data = data.filter((d) => d.store_name === storeFilter);
  if (statusFilter) data = data.filter((d) => d.inventory_status === statusFilter);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach((item) => {
      counts[item.inventory_status] = (counts[item.inventory_status] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  const handleCreateTask = (item: InventoryHealthItem) => {
    const isReplenish = item.inventory_status === '断货预警';
    Modal.confirm({
      title: isReplenish ? '生成补货任务' : '生成库存处理任务',
      content: (
        <div>
          <p>ASIN: {item.asin}</p>
          <p>状态: {item.inventory_status}</p>
          <p>建议: {item.suggested_action}</p>
        </div>
      ),
      onOk: () => {
        createTask({
          task_type: isReplenish ? '补货决策' : '库存管理',
          source_module: '库存健康',
          asin: item.asin,
          store_name: item.store_name,
          owner: '张三',
          priority: isReplenish ? '紧急' : '中',
          reason: `${item.inventory_status}: 可售天数=${item.days_of_supply}天`,
          suggested_action: item.suggested_action,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        message.success('任务已生成');
      },
    });
  };

  const columns = [
    { title: 'ASIN', dataIndex: 'asin', key: 'asin', width: 120 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 110 },
    { title: '店铺', dataIndex: 'store_name', key: 'store_name', width: 130 },
    {
      title: '库存状态',
      dataIndex: 'inventory_status',
      key: 'inventory_status',
      render: (s: InventoryStatus) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    { title: 'FBA 库存', dataIndex: 'fba_qty', key: 'fba_qty', sorter: (a: InventoryHealthItem, b: InventoryHealthItem) => a.fba_qty - b.fba_qty },
    { title: '在途', dataIndex: 'inbound_qty', key: 'inbound_qty' },
    { title: '本地库存', dataIndex: 'local_qty', key: 'local_qty' },
    { title: '日均销量', dataIndex: 'daily_avg_sales', key: 'daily_avg_sales' },
    {
      title: '可售天数',
      dataIndex: 'days_of_supply',
      key: 'days_of_supply',
      render: (v: number) => (
        <Typography.Text type={v < 14 ? 'danger' : v < 30 ? 'warning' : undefined}>
          {v > 900 ? '999+' : v}
        </Typography.Text>
      ),
      sorter: (a: InventoryHealthItem, b: InventoryHealthItem) => a.days_of_supply - b.days_of_supply,
    },
    {
      title: '库存金额',
      dataIndex: 'inventory_value',
      key: 'inventory_value',
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: '利润率',
      dataIndex: 'gross_margin',
      key: 'gross_margin',
      render: (v: number) => (
        <Typography.Text type={v < 0 ? 'danger' : undefined}>{v}%</Typography.Text>
      ),
    },
    {
      title: '补货标签',
      dataIndex: 'replenish_tag',
      key: 'replenish_tag',
      render: (t: InventoryHealthItem['replenish_tag']) => <ReplenishTagComp tag={t} />,
    },
    {
      title: '建议',
      dataIndex: 'suggested_action',
      key: 'suggested_action',
      ellipsis: true,
      width: 180,
    },
    {
      title: '操作',
      key: 'ops',
      render: (_: unknown, record: InventoryHealthItem) => (
        <Button type="link" size="small" onClick={() => handleCreateTask(record)}>
          生成任务
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        库存健康
      </Typography.Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Col key={status} xs={12} md={4}>
            <Card
              size="small"
              hoverable
              onClick={() =>
                setStatusFilter(statusFilter === status ? undefined : (status as InventoryStatus))
              }
              style={{ borderColor: statusFilter === status ? '#1677ff' : undefined }}
            >
              <Tag color={statusColors[status as InventoryStatus]}>{status}</Tag>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>{count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <PageFilter showStore onStoreChange={setStoreFilter} />

      <Card size="small">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => `${r.asin}-${r.store_name}`}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
