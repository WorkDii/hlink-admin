import React from 'react';
import { Col, Card, Table, Tag } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import { STATUS_COLORS } from '../hooks.controller';
import { DrugStatus } from '../types';

interface StockStatusSummaryProps {
  data: DrugStatus;
}

const STOCK_STATUS_ORDER: Array<keyof typeof STATUS_COLORS> = [
  'วิกฤต',
  'ต่ำ',
  'เหมาะสม',
  'เกิน',
  'มากเกินไป'
];

export const StockStatusSummary: React.FC<StockStatusSummaryProps> = ({ data }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <Col span={24}>
        <Card title="สรุปสถานะสต็อก" extra={<PieChartOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  // Prepare data for Table
  const statusData = STOCK_STATUS_ORDER.map(status => ({
    status,
    count: data[status] || 0,
    color: STATUS_COLORS[status]
  }));

  const totalItems = statusData.reduce((sum, item) => sum + item.count, 0);

  const columns = [
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Tag color={record.color}>{status}</Tag>
      ),
    },
    {
      title: 'จำนวน',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => (
        <span style={{ fontWeight: 'bold' }}>{count} รายการ</span>
      ),
    },
    {
      title: 'เปอร์เซ็นต์',
      key: 'percentage',
      render: (record: any) => {
        const percentage = totalItems > 0 ? ((record.count / totalItems) * 100).toFixed(1) : '0.0';
        return `${percentage}%`;
      },
    },
  ];

  return (
    <Col span={6}>
      <Card title="สรุปสถานะสต็อก" extra={<PieChartOutlined />}>
        <Table
          dataSource={statusData}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="status"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>รวม</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{totalItems} รายการ</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong>100.0%</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </Col>
  );
}; 