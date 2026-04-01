/**
 * 页面 6：个人待办看板
 *
 * 展示任务列表，支持按状态/优先级/来源分组
 * 联动：可回跳到原始来源页面
 */
import { useMemo, useState } from 'react';
import { Typography, Table, Card, Row, Col, Select, Space, Button, Tag, Segmented, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PriorityTag, TaskStatusTag } from '../../components/StatusTag';
import { getAllTasks, updateTaskStatus } from '../../task-center';
import type { Task, TaskStatus, SourceModule } from '../../types';

const sourceRouteMap: Record<SourceModule, string> = {
  '广告诊断': '/ad-diagnosis',
  '库存健康': '/inventory-health',
  'ASIN生命周期': '/asin-lifecycle',
  '店铺健康': '/store-health',
  '规则引擎': '/asin-lifecycle',
  '手动创建': '/todo',
};

export default function TodoPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<TaskStatus>();

  const allTasks = useMemo(() => getAllTasks(), [refreshKey]);

  const todayStr = '2026-04-01'; // mock today
  const todayTasks = allTasks.filter(
    (t) => t.due_date <= todayStr && (t.status === '待处理' || t.status === '处理中')
  );
  const weekTasks = allTasks.filter(
    (t) =>
      t.due_date > todayStr &&
      t.due_date <= '2026-04-07' &&
      (t.status === '待处理' || t.status === '处理中')
  );
  const overdueTasks = allTasks.filter((t) => t.status === '逾期');

  let data = allTasks;
  if (viewMode === '今日必做') data = todayTasks;
  else if (viewMode === '本周待办') data = weekTasks;
  else if (viewMode === '逾期任务') data = overdueTasks;
  if (statusFilter) data = data.filter((t) => t.status === statusFilter);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    setRefreshKey((k) => k + 1);
    message.success(`任务 ${taskId} 已更新为 ${newStatus}`);
  };

  const handleJumpToSource = (task: Task) => {
    const baseRoute = sourceRouteMap[task.source_module] || '/';
    navigate(`${baseRoute}?asin=${task.asin}`);
  };

  const columns = [
    { title: '任务ID', dataIndex: 'task_id', key: 'task_id', width: 90 },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: Task['priority']) => <PriorityTag priority={p} />,
      sorter: (a: Task, b: Task) => {
        const order = { '紧急': 0, '高': 1, '中': 2, '低': 3 };
        return order[a.priority] - order[b.priority];
      },
      defaultSortOrder: 'ascend' as const,
    },
    { title: '类型', dataIndex: 'task_type', key: 'task_type', width: 90 },
    {
      title: '来源',
      dataIndex: 'source_module',
      key: 'source_module',
      render: (s: SourceModule) => <Tag>{s}</Tag>,
    },
    { title: 'ASIN', dataIndex: 'asin', key: 'asin', width: 120 },
    { title: '店铺', dataIndex: 'store_name', key: 'store_name', width: 130 },
    { title: '负责人', dataIndex: 'owner', key: 'owner', width: 70 },
    {
      title: '异常原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 200,
    },
    {
      title: '建议动作',
      dataIndex: 'suggested_action',
      key: 'suggested_action',
      ellipsis: true,
      width: 200,
    },
    {
      title: '到期日',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 100,
      render: (d: string) => (
        <Typography.Text type={d < todayStr ? 'danger' : undefined}>{d}</Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: TaskStatus) => <TaskStatusTag status={s} />,
    },
    {
      title: '操作',
      key: 'ops',
      width: 160,
      render: (_: unknown, record: Task) => (
        <Space size="small">
          {record.status === '待处理' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusChange(record.task_id, '处理中')}
            >
              开始
            </Button>
          )}
          {(record.status === '处理中' || record.status === '逾期') && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusChange(record.task_id, '已完成')}
            >
              完成
            </Button>
          )}
          <Button type="link" size="small" onClick={() => handleJumpToSource(record)}>
            查看来源
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        个人待办
      </Typography.Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card
            size="small"
            hoverable
            onClick={() => setViewMode('今日必做')}
            style={{ borderColor: viewMode === '今日必做' ? '#ff4d4f' : undefined }}
          >
            <Typography.Text type="danger">今日必做</Typography.Text>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{todayTasks.length}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card
            size="small"
            hoverable
            onClick={() => setViewMode('本周待办')}
            style={{ borderColor: viewMode === '本周待办' ? '#1677ff' : undefined }}
          >
            <Typography.Text type="secondary">本周待办</Typography.Text>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{weekTasks.length}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card
            size="small"
            hoverable
            onClick={() => setViewMode('逾期任务')}
            style={{ borderColor: viewMode === '逾期任务' ? '#faad14' : undefined }}
          >
            <Typography.Text type="warning">逾期任务</Typography.Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
              {overdueTasks.length}
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" hoverable onClick={() => setViewMode('全部')}>
            <Typography.Text>全部任务</Typography.Text>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{allTasks.length}</div>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as string)}
          options={['全部', '今日必做', '本周待办', '逾期任务']}
        />
        <Select
          placeholder="任务状态"
          allowClear
          style={{ width: 120 }}
          onChange={setStatusFilter}
          options={[
            { label: '待处理', value: '待处理' },
            { label: '处理中', value: '处理中' },
            { label: '已完成', value: '已完成' },
            { label: '逾期', value: '逾期' },
          ]}
        />
      </Space>

      <Card size="small">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="task_id"
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
}
