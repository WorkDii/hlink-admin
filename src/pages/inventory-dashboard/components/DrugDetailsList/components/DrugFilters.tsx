import React from 'react';
import { Space, Input, Radio, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { DrugFiltersProps } from '../types';

export const DrugFilters: React.FC<DrugFiltersProps> = ({
  filterType,
  searchText,
  dataLength,
  linkedCount,
  unlinkedCount,
  onFilterTypeChange,
  onSearchTextChange,
  onDownloadCSV,
}) => {
  return (
    <Space>
      <Input
        placeholder="ค้นหายา..."
        prefix={<SearchOutlined />}
        style={{ width: '300px' }}
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
        allowClear
      />
      <Radio.Group
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value)}
        size="small"
      >
        <Radio.Button value="all">
          ทั้งหมด ({dataLength})
        </Radio.Button>
        <Radio.Button value="linked">
          เชื่อมโยงแล้ว ({linkedCount})
        </Radio.Button>
        <Radio.Button value="unlinked">
          ยังไม่เชื่อมโยง ({unlinkedCount})
        </Radio.Button>
      </Radio.Group>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={onDownloadCSV}
        size="small"
      >
        ดาวน์โหลด CSV
      </Button>
    </Space>
  );
};
