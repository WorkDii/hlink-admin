import React from 'react';
import { Button, Tag, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { DRUG_TYPE_MAP, STATUS_PRIORITY } from '../../../types';
import { TABLE_COLUMN_WIDTHS } from '../constants';
import {
  isLinkedDrug,
  getDrugName,
  getDrugCost,
  getTotalValue,
  formatNumber,
  formatCurrency,
} from '../utils';
import { DrugRecord } from '../types';

/**
 * Generate table column definitions for drug data table
 * 
 * Creates a comprehensive set of columns for displaying drug inventory data
 * with sorting, filtering, and interactive features.
 * 
 * @param onOpenMappingModal - Callback function to open the drug mapping modal
 * @param onCancelMapping - Callback function to cancel/remove drug mapping
 * @returns Array of Ant Design table column configurations
 * 
 * @example
 * ```tsx
 * const columns = createTableColumns(
 *   (record) => console.log('Opening mapping modal for:', record.drugcode),
 *   (record) => console.log('Canceling mapping for:', record.drugcode)
 * );
 * ```
 * 
 * Column features:
 * - Drug Code: Sortable, fixed left column
 * - Drug Name: Shows mapping button for unlinked drugs, cancel button for linked drugs
 * - Drug Type: Mapped from type codes to readable names
 * - Remaining: Right-aligned numbers with formatting
 * - Usage (30 days): Right-aligned numbers with formatting
 * - Ratio: Displays months with bold formatting
 * - Days Remaining: Shows calculated days
 * - Status: Color-coded tags with priority sorting
 * - Cost: Currency formatting with null handling
 * - Total Value: Calculated cost × remaining with formatting
 */
export const createTableColumns = (
  onOpenMappingModal: (record: DrugRecord) => void,
  onCancelMapping: (record: DrugRecord) => void
): ColumnType<DrugRecord>[] => [
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
      key: 'drugcode',
      width: TABLE_COLUMN_WIDTHS.DRUG_CODE,
      fixed: 'left',
      sorter: (a: DrugRecord, b: DrugRecord) => a.drugcode.localeCompare(b.drugcode),
    },
    {
      title: 'ชื่อยา',
      dataIndex: ['hospital_drug', 'name'],
      key: 'hospital_drug.name',
      width: TABLE_COLUMN_WIDTHS.DRUG_NAME,
      ellipsis: true,
      sorter: (a: DrugRecord, b: DrugRecord) => {
        const nameA = getDrugName(a);
        const nameB = getDrugName(b);
        return nameA.localeCompare(nameB);
      },
      render: (_: string, record: DrugRecord) => {
        const name = getDrugName(record);
        if (isLinkedDrug(record.hospital_drug)) {
          return (
            <Space>
              <span >
                {name}
              </span>
              <Popconfirm
                title="ยกเลิกการเชื่อมโยงยา"
                description="คุณแน่ใจหรือไม่ที่จะยกเลิกการเชื่อมโยงยานี้?"
                onConfirm={() => onCancelMapping(record)}
                okText="ยืนยัน"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}

              >
                <Button
                  type="link"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                >
                </Button>
              </Popconfirm>
            </Space>
          );
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
      sorter: (a: DrugRecord, b: DrugRecord) => {
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
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => (a.remaining || 0) - (b.remaining || 0),
      render: (remaining: number) => formatNumber(remaining),
    },
    {
      title: 'ใช้ 30 วัน',
      dataIndex: 'issued30day',
      key: 'issued30day',
      width: TABLE_COLUMN_WIDTHS.ISSUED_30_DAY,
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => (a.issued30day || 0) - (b.issued30day || 0),
      render: (issued: number) => formatNumber(issued),
    },
    {
      title: 'อัตราส่วน',
      key: 'ratio',
      width: TABLE_COLUMN_WIDTHS.RATIO,
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => (a.ratio.value || 0) - (b.ratio.value || 0),
      render: (record: DrugRecord) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.ratio.value} เดือน
        </span>
      ),
    },
    {
      title: 'วันคงเหลือ',
      key: 'days',
      width: TABLE_COLUMN_WIDTHS.DAYS,
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => (a.ratio.days || 0) - (b.ratio.days || 0),
      render: (record: DrugRecord) => (
        <span>{record.ratio.days} วัน</span>
      ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: TABLE_COLUMN_WIDTHS.STATUS,
      sorter: (a: DrugRecord, b: DrugRecord) => {
        const priorityA = STATUS_PRIORITY[a.ratio.status] || 999;
        const priorityB = STATUS_PRIORITY[b.ratio.status] || 999;
        return priorityA - priorityB;
      },
      render: (record: DrugRecord) => (
        <Tag color={record.ratio.color}>
          {record.ratio.status}
        </Tag>
      ),
    },
    {
      title: 'ราคา/หน่วย',
      key: 'cost',
      width: TABLE_COLUMN_WIDTHS.COST,
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => {
        const costA = getDrugCost(a) || 0;
        const costB = getDrugCost(b) || 0;
        return costA - costB;
      },
      render: (record: DrugRecord) => formatCurrency(getDrugCost(record)),
    },
    {
      title: 'มูลค่าคงเหลือ',
      key: 'totalValue',
      width: TABLE_COLUMN_WIDTHS.TOTAL_VALUE,
      align: 'right',
      sorter: (a: DrugRecord, b: DrugRecord) => {
        const totalA = getTotalValue(a) || 0;
        const totalB = getTotalValue(b) || 0;
        return totalA - totalB;
      },
      render: (record: DrugRecord) => formatCurrency(getTotalValue(record)),
    },
  ];
