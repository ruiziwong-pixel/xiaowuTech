/**
 * 统计卡片组件 - 用于总览页的核心指标展示
 */
import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
  onClick?: () => void;
}

export function StatCard({ title, value, prefix, suffix, precision, valueStyle, onClick }: StatCardProps) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      size="small"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
        valueStyle={valueStyle}
      />
    </Card>
  );
}
