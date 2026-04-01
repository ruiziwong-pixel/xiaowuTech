/**
 * 页面 4：广告诊断看板
 *
 * 展示广告异常诊断结果 + 建议动作 + 处理状态
 * 联动：可从此处生成任务 -> 任务中心
 *       支持从 ASIN 页面带参跳入
 */
import { useMemo, useState } from 'react';
import { Typography, Table, Card, Row, Col, Tag, Button, Modal, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import { TaskStatusTag } from '../../components/StatusTag';
import { getAdDiagnosisList } from '../../services';
import { createTask } from '../../task-center';
import type { AdDiagnosisItem, AdIssueType } from '../../types';

const issueTypeColors: Record<AdIssueType, string> = {
  '高ACOS': 'red',
  '有曝光无点击': 'orange',
  '高点击不出单': 'volcano',
  '无曝光': 'purple',
  '可放量': 'green',
  '需控费': 'gold',
};

export default function AdDiagnosisPage() {
  const [searchParams] = useSearchParams();
  const filterAsin = searchParams.get('asin');
  const [storeFilter, setStoreFilter] = useState<string>();
  const [issueFilter, setIssueFilter] = useState<AdIssueType>();

  const allItems = useMemo(() => getAdDiagnosisList(), []);

  let data = allItems;
  if (filterAsin) data = data.filter((d) => d.asin === filterAsin);
  if (storeFilter) data = data.filter((d) => d.store_name === storeFilter);
  if (issueFilter) data = data.filter((d) => d.issue_type === issueFilter);

  // 异常类型分布
  const issueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach((item) => {
      counts[item.issue_type] = (counts[item.issue_type] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  const handleCreateTask = (item: AdDiagnosisItem) => {
    Modal.confirm({
      title: '生成广告优化任务',
      content: (
        <div>
          <p>ASIN: {item.asin}</p>
          <p>异常类型: {item.issue_type}</p>
          <p>建议动作: {item.suggested_action}</p>
        </div>
      ),
      onOk: () => {
        createTask({
          task_type: '广告优化',
          source_module: '广告诊断',
          asin: item.asin,
          store_name: item.store_name,
          owner: '张三', // TODO: 从当前用户获取
          priority: item.issue_type === '高ACOS' ? '紧急' : '中',
          reason: `${item.issue_type}: ACOS=${item.current_acos}%`,
          suggested_action: item.suggested_action,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        message.success('任务已生成，可在个人待办中查看');
      },
    });
  };

  const columns = [
    { title: 'ASIN', dataIndex: 'asin', key: 'asin', width: 120 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 110 },
    { title: '店铺', dataIndex: 'store_name', key: 'store_name', width: 130 },
    {
      title: '异常类型',
      dataIndex: 'issue_type',
      key: 'issue_type',
      render: (t: AdIssueType) => <Tag color={issueTypeColors[t]}>{t}</Tag>,
    },
    {
      title: 'ACOS',
      dataIndex: 'current_acos',
      key: 'current_acos',
      render: (v: number) => (
        <Typography.Text type={v > 30 ? 'danger' : undefined}>{v}%</Typography.Text>
      ),
      sorter: (a: AdDiagnosisItem, b: AdDiagnosisItem) => a.current_acos - b.current_acos,
    },
    {
      title: '曝光',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (v: number) => v.toLocaleString(),
    },
    { title: '点击', dataIndex: 'clicks', key: 'clicks' },
    { title: '广告单', dataIndex: 'orders', key: 'orders' },
    {
      title: '广告花费',
      dataIndex: 'ad_cost',
      key: 'ad_cost',
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: '建议动作',
      dataIndex: 'suggested_action',
      key: 'suggested_action',
      ellipsis: true,
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: AdDiagnosisItem['status']) => <TaskStatusTag status={s} />,
    },
    {
      title: '操作',
      key: 'ops',
      render: (_: unknown, record: AdDiagnosisItem) => (
        <Button type="link" size="small" onClick={() => handleCreateTask(record)}>
          生成任务
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        广告诊断
      </Typography.Title>

      {/* 异常分布卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {Object.entries(issueCounts).map(([type, count]) => (
          <Col key={type} xs={12} md={4}>
            <Card
              size="small"
              hoverable
              onClick={() => setIssueFilter(issueFilter === type ? undefined : (type as AdIssueType))}
              style={{
                borderColor: issueFilter === type ? '#1677ff' : undefined,
              }}
            >
              <Tag color={issueTypeColors[type as AdIssueType]}>{type}</Tag>
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
          rowKey={(r) => `${r.asin}-${r.issue_type}`}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
