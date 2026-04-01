/**
 * 新品识别页面
 *
 * 展示所有新品期 ASIN 的检查点追踪、达标状态、关键指标
 * 支持按检查点（D7/D14/D30）筛选，查看检查点详情
 */
import { useMemo, useState } from 'react';
import {
  Typography,
  Table,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Descriptions,
  Progress,
  Drawer,
  Timeline,
  Statistic,
  Badge,
  Select,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import { WarningTag, CheckpointStatusTag } from '../../components/StatusTag';
import { mockAsinMaster, getLatestMetrics, mockNewProductCheckpoints } from '../../mock-data';
import type { AsinMaster, NewProductCheckpoint, CheckpointStatus } from '../../types';

const checkpointDays: Record<NewProductCheckpoint, number> = { D7: 7, D14: 14, D30: 30 };

/** 计算上架天数 */
function daysSinceLaunch(launchDate: string): number {
  return Math.floor((new Date('2026-03-31').getTime() - new Date(launchDate).getTime()) / 86400000);
}

/** 计算检查点完成进度 */
function getCheckpointProgress(asin: string): { completed: number; total: number } {
  const evals = mockNewProductCheckpoints.filter((e) => e.asin === asin);
  return { completed: evals.length, total: 3 };
}

export default function NewProductPage() {
  const navigate = useNavigate();
  const [storeFilter, setStoreFilter] = useState<string>();
  const [checkpointFilter, setCheckpointFilter] = useState<NewProductCheckpoint>();
  const [detailAsin, setDetailAsin] = useState<AsinMaster | null>(null);

  const latestMetrics = useMemo(() => getLatestMetrics(), []);

  const newProducts = useMemo(() => {
    let list = mockAsinMaster.filter((a) => a.lifecycle_stage === '新品期');
    if (storeFilter) list = list.filter((a) => a.store_name === storeFilter);
    if (checkpointFilter) list = list.filter((a) => a.new_product_checkpoint === checkpointFilter);
    return list;
  }, [storeFilter, checkpointFilter]);

  // 统计卡片数据
  const allNewProducts = mockAsinMaster.filter((a) => a.lifecycle_stage === '新品期');
  const checkpointCounts = {
    D7: allNewProducts.filter((a) => a.new_product_checkpoint === 'D7').length,
    D14: allNewProducts.filter((a) => a.new_product_checkpoint === 'D14').length,
    D30: allNewProducts.filter((a) => a.new_product_checkpoint === 'D30').length,
  };
  const atRiskCount = allNewProducts.filter((a) => a.warning_level !== '无').length;
  const failedCheckpoints = mockNewProductCheckpoints.filter((e) => e.status === '未达标').length;

  const columns = [
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      render: (asin: string, record: AsinMaster) => (
        <a onClick={() => setDetailAsin(record)}>{asin}</a>
      ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 180 },
    { title: '店铺', dataIndex: 'store_name', key: 'store_name', width: 130 },
    { title: '负责人', dataIndex: 'owner', key: 'owner', width: 80 },
    {
      title: '上架日期',
      dataIndex: 'launch_date',
      key: 'launch_date',
      width: 110,
    },
    {
      title: '上架天数',
      key: 'days',
      width: 90,
      render: (_: unknown, record: AsinMaster) => {
        const days = daysSinceLaunch(record.launch_date);
        return <span>{days}天</span>;
      },
    },
    {
      title: '当前检查点',
      dataIndex: 'new_product_checkpoint',
      key: 'checkpoint',
      width: 110,
      render: (cp: NewProductCheckpoint | null) => {
        if (!cp) return <Tag>-</Tag>;
        const colorMap: Record<NewProductCheckpoint, string> = {
          D7: 'blue',
          D14: 'cyan',
          D30: 'purple',
        };
        return <Tag color={colorMap[cp]}>{cp}</Tag>;
      },
    },
    {
      title: '检查点进度',
      key: 'progress',
      width: 130,
      render: (_: unknown, record: AsinMaster) => {
        const { completed, total } = getCheckpointProgress(record.asin);
        return (
          <Progress
            percent={Math.round((completed / total) * 100)}
            steps={3}
            size="small"
            format={() => `${completed}/${total}`}
          />
        );
      },
    },
    {
      title: '达标状态',
      key: 'status',
      width: 90,
      render: (_: unknown, record: AsinMaster) => {
        const evals = mockNewProductCheckpoints.filter((e) => e.asin === record.asin);
        const latest = evals[evals.length - 1];
        if (!latest) return <CheckpointStatusTag status="待检查" />;
        return <CheckpointStatusTag status={latest.status} />;
      },
    },
    {
      title: '风险',
      dataIndex: 'warning_level',
      key: 'warning_level',
      render: (l: AsinMaster['warning_level']) => <WarningTag level={l} />,
    },
    {
      title: '关键指标',
      key: 'metrics',
      width: 200,
      render: (_: unknown, record: AsinMaster) => {
        const m = latestMetrics.find((met) => met.asin === record.asin);
        if (!m) return '-';
        return (
          <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
            <span>销售: ${m.sales}</span>
            <span>CVR: {m.cvr}% | 评分: {m.rating}</span>
          </Space>
        );
      },
    },
    {
      title: '推荐动作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: AsinMaster) => {
        const evals = mockNewProductCheckpoints.filter((e) => e.asin === record.asin);
        const latest = evals[evals.length - 1];
        if (!latest) return <Typography.Text type="secondary">等待首次检查</Typography.Text>;
        if (latest.status === '未达标') {
          return <Typography.Text type="danger">需干预优化</Typography.Text>;
        }
        if (record.new_product_checkpoint === 'D30') {
          return <Typography.Text type="warning">即将评估转稳定期</Typography.Text>;
        }
        return <Typography.Text type="secondary">继续跟进表现</Typography.Text>;
      },
    },
  ];

  // 详情抽屉数据
  const detailEvals = detailAsin
    ? mockNewProductCheckpoints.filter((e) => e.asin === detailAsin.asin)
    : [];
  const detailMetrics = detailAsin
    ? latestMetrics.find((m) => m.asin === detailAsin.asin)
    : null;

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        新品识别
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        追踪新品期 ASIN 的检查点达标情况，及时发现需要干预的新品
      </Typography.Text>

      {/* 概览卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={4}>
          <Card size="small">
            <Statistic title="新品总数" value={allNewProducts.length} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card size="small" hoverable onClick={() => setCheckpointFilter(checkpointFilter === 'D7' ? undefined : 'D7')}
            style={{ borderColor: checkpointFilter === 'D7' ? '#1677ff' : undefined }}>
            <Statistic title="D7 阶段" value={checkpointCounts.D7} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card size="small" hoverable onClick={() => setCheckpointFilter(checkpointFilter === 'D14' ? undefined : 'D14')}
            style={{ borderColor: checkpointFilter === 'D14' ? '#1677ff' : undefined }}>
            <Statistic title="D14 阶段" value={checkpointCounts.D14} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card size="small" hoverable onClick={() => setCheckpointFilter(checkpointFilter === 'D30' ? undefined : 'D30')}
            style={{ borderColor: checkpointFilter === 'D30' ? '#1677ff' : undefined }}>
            <Statistic title="D30 阶段" value={checkpointCounts.D30} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card size="small">
            <Statistic title="风险新品" value={atRiskCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card size="small">
            <Statistic title="未达标检查点" value={failedCheckpoints} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* 筛选 */}
      <Space style={{ marginBottom: 16 }}>
        <PageFilter showStore onStoreChange={setStoreFilter} />
        <Select
          placeholder="检查点"
          allowClear
          style={{ width: 100 }}
          value={checkpointFilter}
          onChange={setCheckpointFilter}
          options={[
            { label: 'D7', value: 'D7' },
            { label: 'D14', value: 'D14' },
            { label: 'D30', value: 'D30' },
          ]}
        />
      </Space>

      {/* 数据表 */}
      <Card size="small">
        <Table
          dataSource={newProducts}
          columns={columns}
          rowKey="asin"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={detailAsin ? `新品详情 - ${detailAsin.asin}` : ''}
        open={!!detailAsin}
        onClose={() => setDetailAsin(null)}
        width={560}
      >
        {detailAsin && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="ASIN">{detailAsin.asin}</Descriptions.Item>
              <Descriptions.Item label="SKU">{detailAsin.sku}</Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>{detailAsin.title}</Descriptions.Item>
              <Descriptions.Item label="店铺">{detailAsin.store_name}</Descriptions.Item>
              <Descriptions.Item label="负责人">{detailAsin.owner}</Descriptions.Item>
              <Descriptions.Item label="上架日期">{detailAsin.launch_date}</Descriptions.Item>
              <Descriptions.Item label="上架天数">
                <Badge
                  count={`${daysSinceLaunch(detailAsin.launch_date)}天`}
                  style={{ backgroundColor: '#1677ff' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="当前检查点">
                <Tag color="purple">{detailAsin.new_product_checkpoint || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险">
                <WarningTag level={detailAsin.warning_level} />
              </Descriptions.Item>
            </Descriptions>

            {/* 最新经营指标 */}
            {detailMetrics && (
              <Card size="small" title="最新经营指标" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="日销售额" value={detailMetrics.sales} prefix="$" precision={2} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="日订单" value={detailMetrics.orders} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="转化率" value={detailMetrics.cvr} suffix="%" precision={1} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Sessions" value={detailMetrics.sessions} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="评分" value={detailMetrics.rating} precision={1} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="ACOS" value={detailMetrics.acos} suffix="%" precision={1} valueStyle={{ fontSize: 16 }} />
                  </Col>
                </Row>
              </Card>
            )}

            {/* 检查点时间线 */}
            <Card size="small" title="检查点追踪" style={{ marginTop: 16 }}>
              {detailEvals.length > 0 ? (
                <Timeline
                  items={detailEvals.map((ev) => ({
                    color: ev.status === '达标' ? 'green' : ev.status === '未达标' ? 'red' : 'blue',
                    dot:
                      ev.status === '达标' ? (
                        <CheckCircleOutlined />
                      ) : ev.status === '未达标' ? (
                        <ExclamationCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      ),
                    children: (
                      <div>
                        <Space>
                          <Typography.Text strong>{ev.checkpoint}</Typography.Text>
                          <CheckpointStatusTag status={ev.status} />
                          <Typography.Text type="secondary">{ev.eval_date}</Typography.Text>
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Row gutter={[8, 4]} style={{ fontSize: 12 }}>
                            <Col span={12}>
                              销售: <Typography.Text type={ev.sales_actual >= ev.sales_target ? 'success' : 'danger'}>
                                ${ev.sales_actual}
                              </Typography.Text> / ${ev.sales_target}
                            </Col>
                            <Col span={12}>
                              Sessions: <Typography.Text type={ev.sessions_actual >= ev.sessions_target ? 'success' : 'danger'}>
                                {ev.sessions_actual}
                              </Typography.Text> / {ev.sessions_target}
                            </Col>
                            <Col span={12}>
                              CVR: <Typography.Text type={ev.cvr_actual >= ev.cvr_target ? 'success' : 'danger'}>
                                {ev.cvr_actual}%
                              </Typography.Text> / {ev.cvr_target}%
                            </Col>
                            <Col span={12}>
                              评分: <Typography.Text type={ev.rating_actual >= ev.rating_target ? 'success' : 'danger'}>
                                {ev.rating_actual}
                              </Typography.Text> / {ev.rating_target}
                            </Col>
                          </Row>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            评价数: {ev.review_count} | {ev.remark}
                          </Typography.Text>
                        </div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Typography.Text type="secondary">暂无检查点记录</Typography.Text>
              )}

              {/* 未完成的检查点 */}
              {(['D7', 'D14', 'D30'] as NewProductCheckpoint[])
                .filter((cp) => !detailEvals.some((e) => e.checkpoint === cp))
                .map((cp) => {
                  const targetDay = checkpointDays[cp];
                  const days = daysSinceLaunch(detailAsin.launch_date);
                  const isUpcoming = days < targetDay;
                  return (
                    <div key={cp} style={{ marginBottom: 8, color: '#999' }}>
                      <Space>
                        <ClockCircleOutlined />
                        <Typography.Text type="secondary">
                          {cp} - {isUpcoming ? `预计 ${targetDay - days} 天后检查` : '待评估'}
                        </Typography.Text>
                      </Space>
                    </div>
                  );
                })}
            </Card>

            <Space style={{ marginTop: 16 }}>
              <Typography.Link
                onClick={() => {
                  setDetailAsin(null);
                  navigate(`/ad-diagnosis?asin=${detailAsin.asin}`);
                }}
              >
                查看广告诊断
              </Typography.Link>
              <Typography.Link
                onClick={() => {
                  setDetailAsin(null);
                  navigate(`/inventory-health?asin=${detailAsin.asin}`);
                }}
              >
                查看库存详情
              </Typography.Link>
              <Typography.Link
                onClick={() => {
                  setDetailAsin(null);
                  navigate(`/asin-lifecycle?asin=${detailAsin.asin}`);
                }}
              >
                返回生命周期总览
              </Typography.Link>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
