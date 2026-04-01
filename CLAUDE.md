# CLAUDE.md - Amazon 精铺运营看板系统

## 项目概述

这是一个面向 Amazon 精铺团队的运营决策系统（非传统 BI），包含标签管理、异常识别、任务待办等功能。
当前阶段使用 Mock 数据，后续逐步接入领星 ERP API。

## 技术栈

- React 18 + TypeScript + Vite + Ant Design 5 + React Router 6
- 中文界面，Ant Design 使用 zhCN locale

## 代码结构

```
src/
├── types/index.ts           # 核心类型定义（实体 + 枚举）
├── mock-data/               # Mock 数据层 → 后续替换为 API 调用
├── services/index.ts        # 服务层（数据聚合）→ ERP API 替换入口，标记为【API替换入口】
├── rule-engine/index.ts     # 规则引擎（占位逻辑）→ 标记为【扩展入口】
├── task-center/index.ts     # 任务中心（CRUD）→ 审批流扩展入口
├── components/              # 通用组件（StatusTag, StatCard, PageFilter）
├── layouts/MainLayout.tsx   # 左侧导航 + 顶栏 + 内容区
└── pages/                   # 6 个业务页面
    ├── overview/            # 经营总览看板
    ├── store-health/        # 店铺健康度看板
    ├── asin-lifecycle/      # ASIN 生命周期看板
    ├── ad-diagnosis/        # 广告诊断看板
    ├── inventory-health/    # 库存健康看板
    └── todo/                # 个人待办看板
```

## 核心业务概念

- **生命周期**：新品期 / 稳定期 / 清货 / 淘汰
- **稳定期等级**：S / A / B / C / D / E
- **新品检查点**：D7 / D14 / D30
- **风险预警**：红色 / 橙色 / 黄色 / 无
- **补货决策**：建议补货 / 暂缓补货 / 禁止补货

## 页面联动

- 经营总览 → 店铺健康 / ASIN 生命周期 / 个人待办（通过路由 query param）
- 店铺健康 → 点击展开 ASIN 列表 → 跳转 ASIN 详情
- ASIN 生命周期 → 抽屉查看详情 → 跳转广告诊断 / 库存健康
- 广告诊断 / 库存健康 → "生成任务"按钮 → 写入 task-center
- 个人待办 → "查看来源"按钮 → 回跳原始页面

## 扩展约定

- 代码中 `【API替换入口】` 注释标记了未来需要替换为真实 API 的位置
- 代码中 `【扩展入口】` 注释标记了规则引擎和任务中心的扩展点
- 代码中 `TODO:` 注释标记了占位逻辑
- 新增页面放在 `src/pages/` 下，并在 `src/App.tsx` 注册路由
- 新增通用组件放在 `src/components/`
- 所有类型定义集中在 `src/types/index.ts`

## 开发命令

```bash
npm run dev    # 开发模式 http://localhost:5173
npm run build  # 生产构建
```
