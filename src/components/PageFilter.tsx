/**
 * 页面筛选区组件
 * 统一的顶部筛选条，各页面可传入不同的筛选项
 */
import { Select, DatePicker, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { mockAsinMaster } from '../mock-data';

const storeOptions = [...new Set(mockAsinMaster.map((a) => a.store_name))].map((s) => ({
  label: s,
  value: s,
}));

const ownerOptions = [...new Set(mockAsinMaster.map((a) => a.owner))].map((o) => ({
  label: o,
  value: o,
}));

const teamOptions = [...new Set(mockAsinMaster.map((a) => a.team))].map((t) => ({
  label: t,
  value: t,
}));

interface PageFilterProps {
  showStore?: boolean;
  showOwner?: boolean;
  showTeam?: boolean;
  showDate?: boolean;
  onStoreChange?: (value: string | undefined) => void;
  onOwnerChange?: (value: string | undefined) => void;
  onTeamChange?: (value: string | undefined) => void;
  onRefresh?: () => void;
}

export function PageFilter({
  showStore = true,
  showOwner = false,
  showTeam = false,
  showDate = false,
  onStoreChange,
  onOwnerChange,
  onTeamChange,
  onRefresh,
}: PageFilterProps) {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      {showStore && (
        <Select
          placeholder="选择店铺"
          allowClear
          style={{ width: 180 }}
          options={storeOptions}
          onChange={onStoreChange}
        />
      )}
      {showOwner && (
        <Select
          placeholder="选择负责人"
          allowClear
          style={{ width: 140 }}
          options={ownerOptions}
          onChange={onOwnerChange}
        />
      )}
      {showTeam && (
        <Select
          placeholder="选择组"
          allowClear
          style={{ width: 120 }}
          options={teamOptions}
          onChange={onTeamChange}
        />
      )}
      {showDate && <DatePicker.RangePicker style={{ width: 240 }} />}
      {onRefresh && (
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
      )}
    </Space>
  );
}
