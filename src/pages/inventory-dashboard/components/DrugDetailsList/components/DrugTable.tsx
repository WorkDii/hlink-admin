import React, { useMemo } from 'react';
import { Table, Tag, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { DRUG_TYPE_MAP, STATUS_PRIORITY, TABLE_COLUMN_WIDTHS, TABLE_SCROLL } from '../constants';
import {
  isLinkedDrug,
  getDrugName,
  getDrugCost,
  getTotalValue,
  formatNumber,
  formatCurrency,
  getRowBackgroundColor
} from '../utils';

interface DrugTableProps {
  data: any[];
  onOpenMappingModal: (record: any) => void;
  pageSize: number;
  onPageSizeChange: (current: number, size: number) => void;
  searchText: string;
}

export const DrugTable: React.FC<DrugTableProps> = ({
  data,
  onOpenMappingModal,
  pageSize,
  onPageSizeChange,
  searchText,
}) => {
  const columns = useMemo(() => [
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
      key: 'drugcode',
      width: TABLE_COLUMN_WIDTHS.DRUG_CODE,
      fixed: 'left' as const,
      sorter: (a: any, b: any) => a.drugcode.localeCompare(b.drugcode),
    },
    {
      title: 'ชื่อยา',
      dataIndex: ['hospital_drug', 'name'],
      key: 'hospital_drug.name',
      width: TABLE_COLUMN_WIDTHS.DRUG_NAME,
      ellipsis: true,
      sorter: (a: any, b: any) => {
        const nameA = getDrugName(a);
        const nameB = getDrugName(b);
        return nameA.localeCompare(nameB);
      },
      render: (_: string, record: any) => {
        const name = getDrugName(record);
        if (isLinkedDrug(record.hospital_drug)) {
          return name;
        }
        return (
          <div>
            <span style={{ color: '#ff4d4f', fontStyle: 'italic' }}>
              {name}
            </span>
            <div style={{ marginTop: '8px' }}>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onOpenMappingModal(record)}
              >
                เชื่อมโยงยา
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype',
      key: 'drugtype',
      width: TABLE_COLUMN_WIDTHS.DRUG_TYPE,
      sorter: (a: any, b: any) => {
        const typeA = DRUG_TYPE_MAP[a.drugtype] || a.drugtype || '';
        const typeB = DRUG_TYPE_MAP[b.drugtype] || b.drugtype || '';
        return typeA.localeCompare(typeB);
      },
      render: (drugtype: string) => DRUG_TYPE_MAP[drugtype] || drugtype,
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      width: TABLE_COLUMN_WIDTHS.REMAINING,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.remaining || 0) - (b.remaining || 0),
      render: (remaining: number) => formatNumber(remaining),
    },
    {
      title: 'ใช้ 30 วัน',
      dataIndex: 'issued30day',
      key: 'issued30day',
      width: TABLE_COLUMN_WIDTHS.ISSUED_30_DAY,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.issued30day || 0) - (b.issued30day || 0),
      render: (issued: number) => formatNumber(issued),
    },
    {
      title: 'อัตราส่วน',
      key: 'ratio',
      width: TABLE_COLUMN_WIDTHS.RATIO,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.ratio.value || 0) - (b.ratio.value || 0),
      render: (record: any) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.ratio.value} เดือน
        </span>
      ),
    },
    {
      title: 'วันคงเหลือ',
      key: 'days',
      width: TABLE_COLUMN_WIDTHS.DAYS,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.ratio.days || 0) - (b.ratio.days || 0),
      render: (record: any) => (
        <span>{record.ratio.days} วัน</span>
      ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: TABLE_COLUMN_WIDTHS.STATUS,
      sorter: (a: any, b: any) => {
        const priorityA = STATUS_PRIORITY[a.ratio.status] || 999;
        const priorityB = STATUS_PRIORITY[b.ratio.status] || 999;
        return priorityA - priorityB;
      },
      render: (record: any) => (
        <Tag color={record.ratio.color}>
          {record.ratio.status}
        </Tag>
      ),
    },
    {
      title: 'ราคา/หน่วย',
      key: 'cost',
      width: TABLE_COLUMN_WIDTHS.COST,
      align: 'right' as const,
      sorter: (a: any, b: any) => {
        const costA = getDrugCost(a) || 0;
        const costB = getDrugCost(b) || 0;
        return costA - costB;
      },
      render: (record: any) => formatCurrency(getDrugCost(record)),
    },
    {
      title: 'มูลค่าคงเหลือ',
      key: 'totalValue',
      width: TABLE_COLUMN_WIDTHS.TOTAL_VALUE,
      align: 'right' as const,
      sorter: (a: any, b: any) => {
        const totalA = getTotalValue(a) || 0;
        const totalB = getTotalValue(b) || 0;
        return totalA - totalB;
      },
      render: (record: any) => formatCurrency(getTotalValue(record)),
    },
  ], [onOpenMappingModal]);

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
      onRow={(record: any) => ({
        style: {
          backgroundColor: getRowBackgroundColor(record.ratio.status)
        }
      })}
    />
  );
};
