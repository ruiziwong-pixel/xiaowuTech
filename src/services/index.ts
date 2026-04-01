/**
 * 服务层 - 数据聚合与业务逻辑
 *
 * 当前阶段：从 mock 数据聚合
 * 后续扩展：替换为领星 ERP API 调用，只需修改此文件
 *
 * 【API 替换入口】每个 get* 函数都是一个独立的 API 接口映射点
 */

import type {
  OverviewSummary,
  StoreSummary,
  AdDiagnosisItem,
  InventoryHealthItem,
  StoreHealthTag,
} from '../types';
import { mockAsinMaster, getLatestMetrics } from '../mock-data';
import { diagnoseAdIssue, diagnoseInventoryStatus, suggestAction } from '../rule-engine';

/** 获取经营总览摘要 - 【API替换入口】*/
export function getOverviewSummary(): OverviewSummary {
  const latestMetrics = getLatestMetrics();
  const totalSales = latestMetrics.reduce((s, m) => s + m.sales, 0);
  const totalProfit = latestMetrics.reduce((s, m) => s + m.gross_profit, 0);
  const totalAdCost = latestMetrics.reduce((s, m) => s + m.ad_cost, 0);
  const totalInventoryValue = latestMetrics.reduce((s, m) => s + m.inventory_value, 0);
  const riskAsins = mockAsinMaster.filter((a) => a.warning_level !== '无');

  return {
    total_sales: Math.round(totalSales * 100) / 100,
    total_profit: Math.round(totalProfit * 100) / 100,
    total_ad_cost: Math.round(totalAdCost * 100) / 100,
    total_inventory_value: Math.round(totalInventoryValue * 100) / 100,
    risk_asin_count: riskAsins.length,
    total_asin_count: mockAsinMaster.length,
    weekly_issues: [
      `${riskAsins.length} 个 ASIN 存在风险预警`,
      `${mockAsinMaster.filter((a) => a.is_clearance).length} 个 ASIN 需要清货处理`,
      `${mockAsinMaster.filter((a) => a.lifecycle_stage === '新品期').length} 个新品需要跟进`,
      '2 个 ASIN 库存低于安全线',
    ],
    suggested_actions: [
      '优先处理红色预警 ASIN 的广告和库存问题',
      '跟进新品 D30 检查点 ASIN 的转化率',
      '启动清货 ASIN 的降价流程',
      '补货 S/A 级 ASIN 以避免断货',
    ],
  };
}

/** 获取店铺健康度列表 - 【API替换入口】*/
export function getStoreSummaries(): StoreSummary[] {
  const storeNames = [...new Set(mockAsinMaster.map((a) => a.store_name))];
  const latestMetrics = getLatestMetrics();

  return storeNames.map((storeName) => {
    const storeAsins = mockAsinMaster.filter((a) => a.store_name === storeName);
    const storeMetrics = latestMetrics.filter((m) => m.store_name === storeName);
    const totalSales = storeMetrics.reduce((s, m) => s + m.sales, 0);
    const totalProfit = storeMetrics.reduce((s, m) => s + m.gross_profit, 0);
    const totalAdCost = storeMetrics.reduce((s, m) => s + m.ad_cost, 0);
    const riskCount = storeAsins.filter((a) => a.warning_level !== '无').length;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    let healthTag: StoreHealthTag;
    if (profitMargin > 20 && riskCount === 0) healthTag = '优秀';
    else if (profitMargin > 15) healthTag = '良好';
    else if (profitMargin > 10) healthTag = '一般';
    else if (profitMargin > 5) healthTag = '预警';
    else healthTag = '危险';

    return {
      store_name: storeName,
      total_sales: Math.round(totalSales * 100) / 100,
      total_profit: Math.round(totalProfit * 100) / 100,
      profit_margin: Math.round(profitMargin * 100) / 100,
      ad_cost: Math.round(totalAdCost * 100) / 100,
      acos: totalSales > 0 ? Math.round((totalAdCost / totalSales) * 10000) / 100 : 0,
      tacos: totalSales > 0 ? Math.round((totalAdCost / totalSales) * 10000) / 100 : 0,
      total_asin_count: storeAsins.length,
      new_product_count: storeAsins.filter((a) => a.lifecycle_stage === '新品期').length,
      stable_count: storeAsins.filter((a) => a.lifecycle_stage === '稳定期').length,
      risk_count: riskCount,
      clearance_count: storeAsins.filter((a) => a.is_clearance).length,
      inventory_value: Math.round(
        storeMetrics.reduce((s, m) => s + m.inventory_value, 0) * 100
      ) / 100,
      health_tag: healthTag,
    };
  });
}

/** 获取广告诊断列表 - 【API替换入口】*/
export function getAdDiagnosisList(): AdDiagnosisItem[] {
  const latestMetrics = getLatestMetrics();
  const items: AdDiagnosisItem[] = [];

  for (const metrics of latestMetrics) {
    const issueType = diagnoseAdIssue(metrics);
    if (issueType) {
      const asin = mockAsinMaster.find((a) => a.asin === metrics.asin);
      items.push({
        asin: metrics.asin,
        sku: asin?.sku || '',
        store_name: metrics.store_name,
        issue_type: issueType,
        current_acos: metrics.acos,
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        orders: metrics.ad_orders,
        ad_cost: metrics.ad_cost,
        suggested_action: suggestAction(issueType),
        status: '未处理',
        related_task_id: null,
      });
    }
  }
  return items;
}

/** 获取库存健康列表 - 【API替换入口】*/
export function getInventoryHealthList(): InventoryHealthItem[] {
  const latestMetrics = getLatestMetrics();
  return latestMetrics.map((metrics) => {
    const asin = mockAsinMaster.find((a) => a.asin === metrics.asin)!;
    const inventoryStatus = diagnoseInventoryStatus(asin, metrics);
    const dailyAvgSales = metrics.orders;
    const daysOfSupply = dailyAvgSales > 0 ? Math.round(metrics.fba_qty / dailyAvgSales) : 999;

    return {
      asin: metrics.asin,
      sku: asin?.sku || '',
      store_name: metrics.store_name,
      inventory_status: inventoryStatus,
      fba_qty: metrics.fba_qty,
      inbound_qty: metrics.inbound_qty,
      local_qty: metrics.local_qty,
      daily_avg_sales: dailyAvgSales,
      days_of_supply: daysOfSupply,
      inventory_value: metrics.inventory_value,
      gross_margin: metrics.gross_margin,
      replenish_tag: asin?.replenish_tag || '暂缓补货',
      suggested_action: suggestAction(inventoryStatus),
    };
  });
}
