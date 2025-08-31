import React, { useMemo } from 'react';
import { Table } from 'antd';
import { TABLE_SCROLL } from '../constants';
import { getRowBackgroundColor } from '../utils';
import { DrugTableProps } from '../types';
import { createTableColumns } from './tableColumns';

export const DrugTable: React.FC<DrugTableProps> = ({
  data,
  onOpenMappingModal,
  pageSize,
  onPageSizeChange,
  searchText,
}) => {
  const columns = useMemo(() => createTableColumns(onOpenMappingModal), [onOpenMappingModal]);

  const paginationConfig = {
    pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    onShowSizeChange: onPageSizeChange,
    showTotal: (total: number, range: [number, number]) => {
      const searchInfo = searchText.trim() ? ` (ค้นหา: "${searchText}")` : '';
      return `${range[0]}-${range[1]} จาก ${total} รายการ ${searchInfo}`;
    },
  };

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      size="small"
      scroll={TABLE_SCROLL}
      pagination={paginationConfig}
      onRow={(record) => ({
        style: {
          backgroundColor: getRowBackgroundColor(record.ratio.status)
        }
      })}
    />
  );
};
