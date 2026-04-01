/**
 * 稳定品管理页面
 *
 * 展示所有稳定期 ASIN 的等级分布、升降级趋势、关键经营指标
 * 支持按等级筛选，查看等级变动历史
 */
import { useMemo, useState } from 'react';
import {
  Typography,
  Table,
  Card,
  Row,
  Col,
  Space,
  Descriptions,
  Drawer,
  Timeline,
  Statistic,
  Select,
  Tag,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import {
  GradeTag,
  WarningTag,
  ReplenishTagComp,
  GradeTrendTag,
} from '../../components/StatusTag';
import { mockAsinMaster, getLatestMetrics, mockStableGradeHistory } from '../../mock-data';
import type { AsinMaster, StableGrade, GradeTrend } from '../../types';

/** 获取最新等级趋势 */
function getLatestTrend(asin: string): GradeTrend | null {
  const records = mockStableGradeHistory.filter((r) => r.asin === asin);
  if (records.length === 0) return null;
  return records[records.length - 1].trend;
}

export default function StableManagementPage() {
  const navigate = useNavigate();
  const [storeFilter, setStoreFilter] = useState<string>();
  const [gradeFilter, setGradeFilter] = useState<StableGrade>();
  const [trendFilter, setTrendFilter] = useState<GradeTrend>();
  const [detailAsin, setDetailAsin] = useState<AsinMaster | null>(null);

  const latestMetrics = useMemo(() => getLatestMetrics(), []);

  const stableProducts = useMemo(() => {
    let list = mockAsinMaster.filter((a) => a.lifecycle_stage === '稳定期');
    if (storeFilter) list = list.filter((a) => a.store_name === storeFilter);
    if (gradeFilter) list = list.filter((a) => a.stable_grade === gradeFilter);
    if (trendFilter) list = list.filter((a) => getLatestTrend(a.asin) === trendFilter);
    return list;
  }, [storeFilter, gradeFilter, trendFilter]);

  // 统计数据
  const allStable = mockAsinMaster.filter((a) => a.lifecycle_stage === '稳定期');
  const gradeCounts: Record<StableGrade, number> = {
    S: allStable.filter((a) => a.stable_grade === 'S').length,
    A: allStable.filter((a) => a.stable_grade === 'A').length,
    B: allStable.filter((a) => a.stable_grade === 'B').length,
    C: allStable.filter((a) => a.stable_grade === 'C').length,
    D: allStable.filter((a) => a.stable_grade === 'D').length,
    E: allStable.filter((a) => a.stable_grade === 'E').length,
  };

  const upgradeCount = allStable.filter((a) => getLatestTrend(a.asin) === '升级').length;
  const downgradeCount = allStable.filter((a) => getLatestTrend(a.asin) === '降级').length;
  const riskCount = allStable.filter((a) => a.warning_level !== '无').length;

  const gradeColorMap: Record<StableGrade, string> = {
    S: '#f50',
    A: '#87d068',
    B: '#2db7f5',
    C: '#faad14',
    D: '#d9d9d9',
    E: '#ff4d4f',
  };

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
      title: '等级',
      dataIndex: 'stable_grade',
      key: 'stable_grade',
      width: 80,
      render: (g: AsinMaster['stable_grade']) => <GradeTag grade={g} />,
      filters: (['S', 'A', 'B', 'C', 'D', 'E'] as StableGrade[]).map((g) => ({
        text: `${g}级`,
        value: g,
      })),
      onFilter: (value: unknown, record: AsinMaster) => record.stable_grade === value,
    },
    {
      title: '趋势',
      key: 'trend',
      width: 90,
      render: (_: unknown, record: AsinMaster) => {
        const trend = getLatestTrend(record.asin);
        if (!trend) return <Tag>-</Tag>;
        return <GradeTrendTag trend={trend} />;
      },
    },
    {
      title: '30天销售',
      key: 'sales_30d',
      width: 110,
      render: (_: unknown, record: AsinMaster) => {
        const history = mockStableGradeHistory.filter((r) => r.asin === record.asin);
        const latest = history[history.length - 1];
        return latest ? `$${latest.sales_30d.toLocaleString()}` : '-';
      },
    },
    {
      title: '利润率',
      key: 'margin',
      width: 80,
      render: (_: unknown, record: AsinMaster) => {
        const history = mockStableGradeHistory.filter((r) => r.asin === record.asin);
        const latest = history[history.length - 1];
        if (!latest) return '-';
        const color = latest.profit_margin_30d >= 20 ? '#52c41a' : latest.profit_margin_30d >= 10 ? '#faad14' : '#ff4d4f';
        return <span style={{ color }}>{latest.profit_margin_30d}%</span>;
      },
    },
    {
      title: 'ACOS',
      key: 'acos',
      width: 80,
      render: (_: unknown, record: AsinMaster) => {
        const history = mockStableGradeHistory.filter((r) => r.asin === record.asin);
        const latest = history[history.length - 1];
        if (!latest) return '-';
        const color = latest.acos_30d <= 20 ? '#52c41a' : latest.acos_30d <= 30 ? '#faad14' : '#ff4d4f';
        return <span style={{ color }}>{latest.acos_30d}%</span>;
      },
    },
    {
      title: '风险',
      dataIndex: 'warning_level',
      key: 'warning_level',
      render: (l: AsinMaster['warning_level']) => <WarningTag level={l} />,
    },
    {
      title: '补货标签',
      dataIndex: 'replenish_tag',
      key: 'replenish_tag',
      render: (t: AsinMaster['replenish_tag']) => <ReplenishTagComp tag={t} />,
    },
    {
      title: '推荐动作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: AsinMaster) => {
        const trend = getLatestTrend(record.asin);
        if (record.warning_level === '红色') return <Typography.Text type="danger">紧急干预</Typography.Text>;
        if (record.warning_level === '橙色') return <Typography.Text type="warning">优化广告/利润</Typography.Text>;
        if (trend === '降级') return <Typography.Text type="warning">关注下滑趋势</Typography.Text>;
        if (record.stable_grade === 'S' || record.stable_grade === 'A') {
          return <Typography.Text type="success">保持优势，确保库存</Typography.Text>;
        }
        if (record.stable_grade === 'D' || record.stable_grade === 'E') {
          return <Typography.Text type="danger">评估是否清货/淘汰</Typography.Text>;
        }
        return <Typography.Text type="secondary">维持运营</Typography.Text>;
      },
    },
  ];

  // 详情抽屉数据
  const detailHistory = detailAsin
    ? mockStableGradeHistory.filter((r) => r.asin === detailAsin.asin)
    : [];
  const detailMetrics = detailAsin
    ? latestMetrics.find((m) => m.asin === detailAsin.asin)
    : null;

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        稳定品管理
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        管理稳定期 ASIN 的等级分布与升降级趋势，识别需要干预的下滑品
      </Typography.Text>

      {/* 等级分布卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {(['S', 'A', 'B', 'C', 'D', 'E'] as StableGrade[]).map((grade) => (
          <Col key={grade} xs={8} md={4}>
            <Card
              size="small"
              hoverable
              onClick={() => setGradeFilter(gradeFilter === grade ? undefined : grade)}
              style={{ borderColor: gradeFilter === grade ? '#1677ff' : undefined }}
            >
              <Statistic
                title={`${grade}级`}
                value={gradeCounts[grade]}
                valueStyle={{ color: gradeColorMap[grade], fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 趋势统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={8} md={4}>
          <Card size="small">
            <Statistic title="稳定品总数" value={allStable.length} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={8} md={4}>
          <Card size="small" hoverable
            onClick={() => setTrendFilter(trendFilter === '升级' ? undefined : '升级')}
            style={{ borderColor: trendFilter === '升级' ? '#1677ff' : undefined }}>
            <Statistic
              title="本月升级"
              value={upgradeCount}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={8} md={4}>
          <Card size="small" hoverable
            onClick={() => setTrendFilter(trendFilter === '降级' ? undefined : '降级')}
            style={{ borderColor: trendFilter === '降级' ? '#1677ff' : undefined }}>
            <Statistic
              title="本月降级"
              value={downgradeCount}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={8} md={4}>
          <Card size="small">
            <Statistic title="风险品" value={riskCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* 筛选 */}
      <Space style={{ marginBottom: 16 }}>
        <PageFilter showStore onStoreChange={setStoreFilter} />
        <Select
          placeholder="等级"
          allowClear
          style={{ width: 80 }}
          value={gradeFilter}
          onChange={setGradeFilter}
          options={(['S', 'A', 'B', 'C', 'D', 'E'] as StableGrade[]).map((g) => ({
            label: `${g}级`,
            value: g,
          }))}
        />
        <Select
          placeholder="趋势"
          allowClear
          style={{ width: 100 }}
          value={trendFilter}
          onChange={setTrendFilter}
          options={[
            { label: '升级', value: '升级' },
            { label: '降级', value: '降级' },
            { label: '持平', value: '持平' },
          ]}
        />
      </Space>

      {/* 数据表 */}
      <Card size="small">
        <Table
          dataSource={stableProducts}
          columns={columns}
          rowKey="asin"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={detailAsin ? `稳定品详情 - ${detailAsin.asin}` : ''}
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
              <Descriptions.Item label="当前等级">
                <GradeTag grade={detailAsin.stable_grade} />
              </Descriptions.Item>
              <Descriptions.Item label="趋势">
                {getLatestTrend(detailAsin.asin) ? (
                  <GradeTrendTag trend={getLatestTrend(detailAsin.asin)!} />
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="风险">
                <WarningTag level={detailAsin.warning_level} />
              </Descriptions.Item>
              <Descriptions.Item label="补货">
                <ReplenishTagComp tag={detailAsin.replenish_tag} />
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
                    <Statistic title="利润" value={detailMetrics.gross_profit} prefix="$" precision={2} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="利润率" value={detailMetrics.gross_margin} suffix="%" precision={1} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="ACOS" value={detailMetrics.acos} suffix="%" precision={1} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="FBA库存" value={detailMetrics.fba_qty} valueStyle={{ fontSize: 16 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="在途" value={detailMetrics.inbound_qty} valueStyle={{ fontSize: 16 }} />
                  </Col>
                </Row>
              </Card>
            )}

            {/* 等级变动历史 */}
            <Card size="small" title="等级变动历史" style={{ marginTop: 16 }}>
              {detailHistory.length > 0 ? (
                <Timeline
                  items={detailHistory.map((record) => ({
                    color:
                      record.trend === '升级'
                        ? 'green'
                        : record.trend === '降级'
                        ? 'red'
                        : 'gray',
                    dot:
                      record.trend === '升级' ? (
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      ) : record.trend === '降级' ? (
                        <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                      ) : (
                        <MinusOutlined style={{ color: '#999' }} />
                      ),
                    children: (
                      <div>
                        <Space>
                          <Typography.Text strong>{record.date}</Typography.Text>
                          <GradeTag grade={record.grade} />
                          <GradeTrendTag trend={record.trend} />
                        </Space>
                        <div style={{ marginTop: 4, fontSize: 12 }}>
                          <Row gutter={8}>
                            <Col span={8}>30天销售: ${record.sales_30d.toLocaleString()}</Col>
                            <Col span={8}>利润率: {record.profit_margin_30d}%</Col>
                            <Col span={8}>ACOS: {record.acos_30d}%</Col>
                          </Row>
                          <Typography.Text type="secondary">{record.remark}</Typography.Text>
                        </div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Typography.Text type="secondary">暂无等级变动记录</Typography.Text>
              )}
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
