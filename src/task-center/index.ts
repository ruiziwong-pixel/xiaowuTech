/**
 * 任务中心 - 任务生成与管理
 *
 * 当前阶段：内存操作 mock 数据
 * 后续扩展：
 *   1. 接入后端任务 API
 *   2. 接入审批流
 *   3. 接入通知系统
 *
 * 【扩展入口】createTask / updateTaskStatus
 */

import type { Task, TaskType, SourceModule, TaskPriority, TaskStatus } from '../types';
import { mockTasks } from '../mock-data';

let tasks = [...mockTasks];
let taskIdCounter = tasks.length + 1;

/** 获取所有任务 */
export function getAllTasks(): Task[] {
  return [...tasks];
}

/** 按负责人获取任务 */
export function getTasksByOwner(owner: string): Task[] {
  return tasks.filter((t) => t.owner === owner);
}

/** 按 ASIN 获取任务 */
export function getTasksByAsin(asin: string): Task[] {
  return tasks.filter((t) => t.asin === asin);
}

/** 按状态获取任务 */
export function getTasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

/** 获取今日到期任务 */
export function getTodayTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(
    (t) => t.due_date <= today && (t.status === '待处理' || t.status === '处理中')
  );
}

/** 获取逾期任务 */
export function getOverdueTasks(): Task[] {
  return tasks.filter((t) => t.status === '逾期');
}

/**
 * 创建任务
 * 【扩展入口】后续可在此接入审批流
 */
export function createTask(params: {
  task_type: TaskType;
  source_module: SourceModule;
  asin: string;
  store_name: string;
  owner: string;
  priority: TaskPriority;
  reason: string;
  suggested_action: string;
  due_date: string;
}): Task {
  const newTask: Task = {
    task_id: `TASK-${String(taskIdCounter++).padStart(3, '0')}`,
    ...params,
    status: '待处理',
    created_at: new Date().toISOString().split('T')[0],
  };
  tasks = [newTask, ...tasks];
  return newTask;
}

/**
 * 更新任务状态
 * 【扩展入口】后续可在此接入状态流转规则
 */
export function updateTaskStatus(taskId: string, status: TaskStatus): Task | null {
  const idx = tasks.findIndex((t) => t.task_id === taskId);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], status };
  return tasks[idx];
}
