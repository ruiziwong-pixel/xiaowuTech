/**
 * 规则引擎 - 占位实现
 *
 * 当前阶段：所有规则为简化的占位逻辑，用于 Demo 展示
 * 后续扩展：
 *   1. 可替换为配置化规则引擎（如 json-rules-engine）
 *   2. 可接入后端规则服务
 *   3. 每个规则函数的签名保持不变，只替换内部实现
 *
 * 【扩展入口】每个 evaluate* 函数都是独立的规则入口
 */

import type {
  AsinMaster,
  DailyMetrics,
  LifecycleStage,
  StableGrade,
  WarningLevel,
  ReplenishTag,
  AdIssueType,
  InventoryStatus,
} from '../types';

/** 评估生命周期阶段（占位逻辑）*/
export function evaluateLifecycle(asin: AsinMaster, _metrics: DailyMetrics[]): LifecycleStage {
  // TODO: 接入真实规则 - 根据上架天数、销量趋势、利润等综合判断
  const daysSinceLaunch = Math.floor(
    (Date.now() - new Date(asin.launch_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (asin.is_eliminated) return '淘汰';
  if (asin.is_clearance) return '清货';
  if (daysSinceLaunch <= 30) return '新品期';
  return '稳定期';
}

/** 评估稳定期等级（占位逻辑）*/
export function evaluateStableGrade(
  _asin: AsinMaster,
  metrics: DailyMetrics[]
): StableGrade | null {
  // TODO: 接入真实规则 - 基于销售额、利润率、广告效率等综合评分
  if (metrics.length === 0) return null;
  const avgSales = metrics.reduce((s, m) => s + m.sales, 0) / metrics.length;
  const avgMargin = metrics.reduce((s, m) => s + m.gross_margin, 0) / metrics.length;
  const score = avgSales * 0.5 + avgMargin * 10;
  if (score > 300) return 'S';
  if (score > 200) return 'A';
  if (score > 150) return 'B';
  if (score > 100) return 'C';
  if (score > 50) return 'D';
  return 'E';
}

/** 评估风险预警（占位逻辑）*/
export function evaluateWarning(asin: AsinMaster, metrics: DailyMetrics[]): WarningLevel {
  // TODO: 接入真实规则 - 综合利润趋势、库存周转、广告 ROI 等
  if (metrics.length === 0) return '无';
  const latestMetrics = metrics[metrics.length - 1];
  if (latestMetrics.gross_margin < 0 && latestMetrics.acos > 40) return '红色';
  if (latestMetrics.acos > 35 || latestMetrics.gross_margin < 5) return '橙色';
  if (latestMetrics.acos > 25) return '黄色';
  return asin.warning_level; // fallback to existing
}

/** 评估补货决策（占位逻辑）*/
export function evaluateReplenish(asin: AsinMaster, metrics: DailyMetrics[]): ReplenishTag {
  // TODO: 接入真实补货模型 - 考虑安全库存、在途、供应链周期等
  if (asin.is_clearance || asin.is_eliminated) return '禁止补货';
  if (metrics.length === 0) return '暂缓补货';
  const latest = metrics[metrics.length - 1];
  const daysOfSupply = latest.orders > 0 ? latest.fba_qty / (latest.orders || 1) : 999;
  if (daysOfSupply < 14) return '建议补货';
  if (daysOfSupply < 30) return '暂缓补货';
  return '暂缓补货';
}

/** 诊断广告异常类型（占位逻辑）*/
export function diagnoseAdIssue(metrics: DailyMetrics): AdIssueType | null {
  // TODO: 接入真实广告诊断规则
  if (metrics.acos > 40) return '高ACOS';
  if (metrics.impressions > 1000 && metrics.clicks < 5) return '有曝光无点击';
  if (metrics.clicks > 20 && metrics.ad_orders === 0) return '高点击不出单';
  if (metrics.impressions < 50) return '无曝光';
  if (metrics.acos < 15 && metrics.acos > 0) return '可放量';
  if (metrics.acos > 30) return '需控费';
  return null;
}

/** 诊断库存健康状态（占位逻辑）*/
export function diagnoseInventoryStatus(
  asin: AsinMaster,
  metrics: DailyMetrics
): InventoryStatus {
  // TODO: 接入真实库存健康模型
  const dailyAvgSales = metrics.orders;
  const daysOfSupply = dailyAvgSales > 0 ? metrics.fba_qty / dailyAvgSales : 999;

  if (daysOfSupply < 7) return '断货预警';
  if (asin.is_clearance) return '清货候选';
  if (asin.replenish_tag === '禁止补货') return '禁补候选';
  if (daysOfSupply > 90 && metrics.gross_margin < 0) return '高库存负利润';
  if (daysOfSupply > 90) return '高库存低动销';
  return '健康库存';
}

/** 生成建议动作文本（占位逻辑）*/
export function suggestAction(issueType: string): string {
  // TODO: 接入动作推荐引擎
  const actionMap: Record<string, string> = {
    '高ACOS': '降低竞价，暂停低效关键词',
    '有曝光无点击': '优化主图和标题，检查价格竞争力',
    '高点击不出单': '优化 Listing 详情页，检查评价和价格',
    '无曝光': '检查广告是否活跃，提高竞价或拓宽匹配',
    '可放量': '提高预算和竞价，拓展关键词',
    '需控费': '收紧匹配方式，降低竞价，暂停低效词',
    '断货预警': '紧急补货，检查供应链',
    '高库存低动销': '检查动销原因，考虑促销',
    '高库存负利润': '评估是否清货，调整价格策略',
    '清货候选': '启动清货流程，站外或降价',
    '禁补候选': '停止补货，评估是否淘汰',
  };
  return actionMap[issueType] || '请人工评估';
}
