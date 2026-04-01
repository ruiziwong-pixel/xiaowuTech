/**
 * 页面 3：ASIN 生命周期看板
 *
 * 展示所有 ASIN 的生命周期、等级、风险、推荐动作
 * 联动：点击 ASIN -> 查看详情（广告/库存/任务）
 *       支持从其他页面带参跳入
 */
import { useMemo, useState } from 'react';
import { Typography, Table, Card, Row, Col, Select, Space, Descriptions, Button, Drawer } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageFilter } from '../../components/PageFilter';
import { LifecycleTag, GradeTag, WarningTag, ReplenishTagComp } from '../../components/StatusTag';
import { mockAsinMaster, getLatestMetrics } from '../../mock-data';
import { getTasksByAsin } from '../../task-center';
import type { AsinMaster, LifecycleStage } from '../../types';

export default function AsinLifecyclePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterWarning = searchParams.get('warning');
  const filterAsin = searchParams.get('asin');
  const [storeFilter, setStoreFilter] = useState<string>();
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleStage>();
  const [detailAsin, setDetailAsin] = useState<AsinMaster | null>(
    filterAsin ? mockAsinMaster.find((a) => a.asin === filterAsin) || null : null
  );

  const latestMetrics = useMemo(() => getLatestMetrics(), []);

  let data = useMemo(() => {
    let list = [...mockAsinMaster];
    if (filterWarning === 'risk') {
      list = list.filter((a) => a.warning_level !== '无');
    }
    return list;
  }, [filterWarning]);

  if (storeFilter) data = data.filter((a) => a.store_name === storeFilter);
  if (lifecycleFilter) data = data.filter((a) => a.lifecycle_stage === lifecycleFilter);

  const lifecycleCounts = {
    '新品期': mockAsinMaster.filter((a) => a.lifecycle_stage === '新品期').length,
    '稳定期': mockAsinMaster.filter((a) => a.lifecycle_stage === '稳定期').length,
    '清货': mockAsinMaster.filter((a) => a.lifecycle_stage === '清货').length,
    '淘汰': mockAsinMaster.filter((a) => a.lifecycle_stage === '淘汰').length,
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
      title: '生命周期',
      dataIndex: 'lifecycle_stage',
      key: 'lifecycle_stage',
      render: (s: LifecycleStage) => <LifecycleTag stage={s} />,
      filters: [
        { text: '新品期', value: '新品期' },
        { text: '稳定期', value: '稳定期' },
        { text: '清货', value: '清货' },
        { text: '淘汰', value: '淘汰' },
      ],
      onFilter: (value: unknown, record: AsinMaster) => record.lifecycle_stage === value,
    },
    {
      title: '等级',
      dataIndex: 'stable_grade',
      key: 'stable_grade',
      render: (g: AsinMaster['stable_grade']) => <GradeTag grade={g} />,
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
      width: 200,
      render: (_: unknown, record: AsinMaster) => {
        if (record.is_clearance) return <Typography.Text type="warning">启动清货</Typography.Text>;
        if (record.is_eliminated) return <Typography.Text type="danger">已淘汰</Typography.Text>;
        if (record.warning_level === '红色') return <Typography.Text type="danger">紧急处理风险</Typography.Text>;
        if (record.warning_level === '橙色') return <Typography.Text type="warning">关注并优化</Typography.Text>;
        if (record.lifecycle_stage === '新品期') return <Typography.Text type="secondary">跟进新品表现</Typography.Text>;
        return <Typography.Text type="secondary">维持运营</Typography.Text>;
      },
    },
  ];

  // 详情面板中获取该 ASIN 的指标和任务
  const detailMetrics = detailAsin
    ? latestMetrics.find((m) => m.asin === detailAsin.asin)
    : null;
  const detailTasks = detailAsin ? getTasksByAsin(detailAsin.asin) : [];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        ASIN 生命周期看板
      </Typography.Title>

      {/* 生命周期分布卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {(Object.entries(lifecycleCounts) as [LifecycleStage, number][]).map(([stage, count]) => (
          <Col key={stage} xs={12} md={6}>
            <Card
              size="small"
              hoverable
              onClick={() => setLifecycleFilter(lifecycleFilter === stage ? undefined : stage)}
              style={{
                borderColor: lifecycleFilter === stage ? '#1677ff' : undefined,
              }}
            >
              <LifecycleTag stage={stage} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <PageFilter showStore onStoreChange={setStoreFilter} />
        <Select
          placeholder="生命周期"
          allowClear
          style={{ width: 120 }}
          value={lifecycleFilter}
          onChange={setLifecycleFilter}
          options={[
            { label: '新品期', value: '新品期' },
            { label: '稳定期', value: '稳定期' },
            { label: '清货', value: '清货' },
            { label: '淘汰', value: '淘汰' },
          ]}
        />
      </Space>

      <Card size="small">
        <Table dataSource={data} columns={columns} rowKey="asin" size="small" pagination={{ pageSize: 10 }} />
      </Card>

      {/* ASIN 详情抽屉 - 联动广告/库存/任务 */}
      <Drawer
        title={detailAsin ? `${detailAsin.asin} - ${detailAsin.title}` : ''}
        open={!!detailAsin}
        onClose={() => setDetailAsin(null)}
        width={520}
      >
        {detailAsin && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="ASIN">{detailAsin.asin}</Descriptions.Item>
              <Descriptions.Item label="SKU">{detailAsin.sku}</Descriptions.Item>
              <Descriptions.Item label="店铺">{detailAsin.store_name}</Descriptions.Item>
              <Descriptions.Item label="负责人">{detailAsin.owner}</Descriptions.Item>
              <Descriptions.Item label="上架日期">{detailAsin.launch_date}</Descriptions.Item>
              <Descriptions.Item label="生命周期">
                <LifecycleTag stage={detailAsin.lifecycle_stage} />
              </Descriptions.Item>
              <Descriptions.Item label="等级">
                <GradeTag grade={detailAsin.stable_grade} />
              </Descriptions.Item>
              <Descriptions.Item label="风险">
                <WarningTag level={detailAsin.warning_level} />
              </Descriptions.Item>
              <Descriptions.Item label="补货">
                <ReplenishTagComp tag={detailAsin.replenish_tag} />
              </Descriptions.Item>
              <Descriptions.Item label="清货">{detailAsin.is_clearance ? '是' : '否'}</Descriptions.Item>
            </Descriptions>

            {detailMetrics && (
              <Card size="small" title="最新经营指标" style={{ marginTop: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="销售额">${detailMetrics.sales}</Descriptions.Item>
                  <Descriptions.Item label="利润">${detailMetrics.gross_profit}</Descriptions.Item>
                  <Descriptions.Item label="利润率">{detailMetrics.gross_margin}%</Descriptions.Item>
                  <Descriptions.Item label="ACOS">{detailMetrics.acos}%</Descriptions.Item>
                  <Descriptions.Item label="FBA库存">{detailMetrics.fba_qty}</Descriptions.Item>
                  <Descriptions.Item label="在途">{detailMetrics.inbound_qty}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card size="small" title={`相关任务 (${detailTasks.length})`} style={{ marginTop: 16 }}>
              {detailTasks.length > 0 ? (
                detailTasks.map((t) => (
                  <Card.Grid key={t.task_id} style={{ width: '100%', padding: 12 }}>
                    <Typography.Text strong>{t.task_id}</Typography.Text> - {t.task_type}
                    <br />
                    <Typography.Text type="secondary">{t.reason}</Typography.Text>
                    <br />
                    <Typography.Text type="warning">{t.suggested_action}</Typography.Text>
                  </Card.Grid>
                ))
              ) : (
                <Typography.Text type="secondary">暂无任务</Typography.Text>
              )}
            </Card>

            <Space style={{ marginTop: 16 }}>
              <Button
                type="link"
                onClick={() => {
                  setDetailAsin(null);
                  navigate(`/ad-diagnosis?asin=${detailAsin.asin}`);
                }}
              >
                查看广告诊断
              </Button>
              <Button
                type="link"
                onClick={() => {
                  setDetailAsin(null);
                  navigate(`/inventory-health?asin=${detailAsin.asin}`);
                }}
              >
                查看库存详情
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
