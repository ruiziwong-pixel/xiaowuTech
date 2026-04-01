/**
 * 通用状态标签组件
 * 用于展示生命周期、等级、风险、补货等各类标签
 */
import { Tag } from 'antd';
import type { LifecycleStage, StableGrade, WarningLevel, ReplenishTag, TaskStatus, StoreHealthTag, TaskPriority } from '../types';

const lifecycleColors: Record<LifecycleStage, string> = {
  '新品期': 'blue',
  '稳定期': 'green',
  '清货': 'orange',
  '淘汰': 'red',
};

const gradeColors: Record<StableGrade, string> = {
  S: '#f50',
  A: '#87d068',
  B: '#2db7f5',
  C: '#faad14',
  D: '#d9d9d9',
  E: '#ff4d4f',
};

const warningColors: Record<WarningLevel, string> = {
  '红色': 'red',
  '橙色': 'orange',
  '黄色': 'gold',
  '无': 'default',
};

const replenishColors: Record<ReplenishTag, string> = {
  '建议补货': 'green',
  '暂缓补货': 'gold',
  '禁止补货': 'red',
  '无': 'default',
};

const taskStatusColors: Record<TaskStatus, string> = {
  '待处理': 'blue',
  '处理中': 'processing',
  '已完成': 'success',
  '已关闭': 'default',
  '逾期': 'error',
};

const healthTagColors: Record<StoreHealthTag, string> = {
  '优秀': '#52c41a',
  '良好': '#73d13d',
  '一般': '#faad14',
  '预警': '#ff7a45',
  '危险': '#ff4d4f',
};

const priorityColors: Record<TaskPriority, string> = {
  '紧急': 'red',
  '高': 'orange',
  '中': 'blue',
  '低': 'default',
};

export function LifecycleTag({ stage }: { stage: LifecycleStage }) {
  return <Tag color={lifecycleColors[stage]}>{stage}</Tag>;
}

export function GradeTag({ grade }: { grade: StableGrade | null }) {
  if (!grade) return <Tag>-</Tag>;
  return <Tag color={gradeColors[grade]}>{grade}级</Tag>;
}

export function WarningTag({ level }: { level: WarningLevel }) {
  if (level === '无') return <Tag>正常</Tag>;
  return <Tag color={warningColors[level]}>{level}预警</Tag>;
}

export function ReplenishTagComp({ tag }: { tag: ReplenishTag }) {
  if (tag === '无') return null;
  return <Tag color={replenishColors[tag]}>{tag}</Tag>;
}

export function TaskStatusTag({ status }: { status: TaskStatus | '未处理' }) {
  if (status === '未处理') return <Tag>未处理</Tag>;
  return <Tag color={taskStatusColors[status]}>{status}</Tag>;
}

export function HealthTag({ tag }: { tag: StoreHealthTag }) {
  return <Tag color={healthTagColors[tag]}>{tag}</Tag>;
}

export function PriorityTag({ priority }: { priority: TaskPriority }) {
  return <Tag color={priorityColors[priority]}>{priority}</Tag>;
}
