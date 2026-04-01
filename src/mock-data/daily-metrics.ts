/**
 * Mock 数据 - 每日经营指标
 * TODO: 后续替换为领星 ERP API 的销售/广告/库存接口
 */
import type { DailyMetrics } from '../types';
import { mockAsinMaster } from './asin-master';

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateMetricsForAsin(asin: string, storeName: string): DailyMetrics[] {
  const days: DailyMetrics[] = [];
  const base = asin.charCodeAt(3) % 5; // variety by asin
  for (let i = 0; i < 30; i++) {
    const date = new Date(2026, 2, i + 1); // March 2026
    const dateStr = date.toISOString().split('T')[0];
    const sales = rand(50 + base * 80, 500 + base * 200);
    const orders = Math.round(sales / rand(15, 35));
    const adCost = rand(10 + base * 5, 80 + base * 20);
    const grossProfit = sales * rand(0.08, 0.35);
    const sessions = Math.round(orders / rand(0.05, 0.2));
    const impressions = Math.round(sessions * rand(8, 25));
    const clicks = Math.round(impressions * rand(0.01, 0.08));
    const adOrders = Math.round(clicks * rand(0.05, 0.15));

    days.push({
      date: dateStr,
      asin,
      store_name: storeName,
      sales,
      orders,
      gross_profit: Math.round(grossProfit * 100) / 100,
      gross_margin: Math.round((grossProfit / sales) * 10000) / 100,
      ad_cost: adCost,
      acos: orders > 0 ? Math.round((adCost / sales) * 10000) / 100 : 0,
      tacos: sales > 0 ? Math.round((adCost / sales) * 10000) / 100 : 0,
      sessions,
      cvr: sessions > 0 ? Math.round((orders / sessions) * 10000) / 100 : 0,
      rating: rand(3.5, 4.9),
      fba_qty: Math.round(rand(20, 800)),
      inbound_qty: Math.round(rand(0, 200)),
      local_qty: Math.round(rand(0, 500)),
      inventory_value: rand(500, 15000),
      impressions,
      clicks,
      ad_orders: adOrders,
    });
  }
  return days;
}

export const mockDailyMetrics: DailyMetrics[] = mockAsinMaster.flatMap((a) =>
  generateMetricsForAsin(a.asin, a.store_name)
);

/** 获取最近 N 天的数据 */
export function getRecentMetrics(days: number = 7): DailyMetrics[] {
  const allDates = [...new Set(mockDailyMetrics.map((m) => m.date))].sort().reverse();
  const recentDates = new Set(allDates.slice(0, days));
  return mockDailyMetrics.filter((m) => recentDates.has(m.date));
}

/** 获取最新一天的数据 */
export function getLatestMetrics(): DailyMetrics[] {
  const latestDate = [...new Set(mockDailyMetrics.map((m) => m.date))].sort().reverse()[0];
  return mockDailyMetrics.filter((m) => m.date === latestDate);
}
