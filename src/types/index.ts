/**
 * Amazon 精铺运营看板 - 核心类型定义
 *
 * 这些类型对应七、数据模型骨架中定义的实体
 * 后续接入领星 ERP API 时，只需调整 services 层的数据映射
 */

// ========== 枚举类型 ==========

/** 生命周期阶段 */
export type LifecycleStage = '新品期' | '稳定期' | '清货' | '淘汰';

/** 稳定期等级 */
export type StableGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

/** 新品检查点 */
export type NewProductCheckpoint = 'D7' | 'D14' | 'D30';

/** 风险预警等级 */
export type WarningLevel = '红色' | '橙色' | '黄色' | '无';

/** 补货决策 */
export type ReplenishTag = '建议补货' | '暂缓补货' | '禁止补货' | '无';

/** 任务状态 */
export type TaskStatus = '待处理' | '处理中' | '已完成' | '已关闭' | '逾期';

/** 任务优先级 */
export type TaskPriority = '紧急' | '高' | '中' | '低';

/** 任务类型 */
export type TaskType = '广告优化' | '库存管理' | '价格调整' | '清货处理' | '新品跟进' | '补货决策' | '其他';

/** 来源模块 */
export type SourceModule = '广告诊断' | '库存健康' | 'ASIN生命周期' | '店铺健康' | '规则引擎' | '手动创建';

/** 店铺健康标签 */
export type StoreHealthTag = '优秀' | '良好' | '一般' | '预警' | '危险';

/** 广告异常类型 */
export type AdIssueType = '高ACOS' | '有曝光无点击' | '高点击不出单' | '无曝光' | '可放量' | '需控费';

/** 库存状态 */
export type InventoryStatus = '断货预警' | '高库存低动销' | '高库存负利润' | '健康库存' | '清货候选' | '禁补候选';

/** 新品检查点达标状态 */
export type CheckpointStatus = '达标' | '未达标' | '待检查';

/** 稳定品等级趋势 */
export type GradeTrend = '升级' | '降级' | '持平';

// ========== 1. ASIN 主表 ==========
export interface AsinMaster {
  asin: string;
  sku: string;
  title: string;
  image_url: string;
  store_name: string;
  owner: string;
  team: string;
  launch_date: string;
  lifecycle_stage: LifecycleStage;
  stable_grade: StableGrade | null;
  new_product_checkpoint: NewProductCheckpoint | null;
  warning_level: WarningLevel;
  replenish_tag: ReplenishTag;
  is_clearance: boolean;
  is_eliminated: boolean;
}

// ========== 2. 每日经营指标表 ==========
export interface DailyMetrics {
  date: string;
  asin: string;
  store_name: string;
  sales: number;
  orders: number;
  gross_profit: number;
  gross_margin: number;
  ad_cost: number;
  acos: number;
  tacos: number;
  sessions: number;
  cvr: number;
  rating: number;
  fba_qty: number;
  inbound_qty: number;
  local_qty: number;
  inventory_value: number;
  // 广告详细指标
  impressions: number;
  clicks: number;
  ad_orders: number;
}

// ========== 3. 规则结果表 ==========
export interface RuleResult {
  asin: string;
  date: string;
  lifecycle_result: LifecycleStage;
  stable_grade_result: StableGrade | null;
  new_product_result: NewProductCheckpoint | null;
  warning_result: WarningLevel;
  replenish_result: ReplenishTag;
  suggested_action: string;
}

// ========== 4. 任务表 ==========
export interface Task {
  task_id: string;
  task_type: TaskType;
  source_module: SourceModule;
  asin: string;
  store_name: string;
  owner: string;
  priority: TaskPriority;
  reason: string;
  suggested_action: string;
  status: TaskStatus;
  due_date: string;
  created_at: string;
}

// ========== 聚合视图类型 ==========

/** 店铺摘要 */
export interface StoreSummary {
  store_name: string;
  total_sales: number;
  total_profit: number;
  profit_margin: number;
  ad_cost: number;
  acos: number;
  tacos: number;
  total_asin_count: number;
  new_product_count: number;
  stable_count: number;
  risk_count: number;
  clearance_count: number;
  inventory_value: number;
  health_tag: StoreHealthTag;
}

/** 广告诊断条目 */
export interface AdDiagnosisItem {
  asin: string;
  sku: string;
  store_name: string;
  issue_type: AdIssueType;
  current_acos: number;
  impressions: number;
  clicks: number;
  orders: number;
  ad_cost: number;
  suggested_action: string;
  status: TaskStatus | '未处理';
  related_task_id: string | null;
}

/** 库存健康条目 */
export interface InventoryHealthItem {
  asin: string;
  sku: string;
  store_name: string;
  inventory_status: InventoryStatus;
  fba_qty: number;
  inbound_qty: number;
  local_qty: number;
  daily_avg_sales: number;
  days_of_supply: number;
  inventory_value: number;
  gross_margin: number;
  replenish_tag: ReplenishTag;
  suggested_action: string;
}

/** 经营总览汇总 */
export interface OverviewSummary {
  total_sales: number;
  total_profit: number;
  total_ad_cost: number;
  total_inventory_value: number;
  risk_asin_count: number;
  total_asin_count: number;
  weekly_issues: string[];
  suggested_actions: string[];
}

/** 新品检查点评估记录 */
export interface NewProductCheckpointEval {
  asin: string;
  checkpoint: NewProductCheckpoint;
  eval_date: string;
  status: CheckpointStatus;
  sales_target: number;
  sales_actual: number;
  sessions_target: number;
  sessions_actual: number;
  cvr_target: number;
  cvr_actual: number;
  rating_target: number;
  rating_actual: number;
  review_count: number;
  remark: string;
}

/** 稳定品等级变动记录 */
export interface StableGradeHistory {
  asin: string;
  date: string;
  grade: StableGrade;
  prev_grade: StableGrade | null;
  trend: GradeTrend;
  sales_30d: number;
  profit_margin_30d: number;
  acos_30d: number;
  remark: string;
}
