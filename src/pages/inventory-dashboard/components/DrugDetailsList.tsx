import React, { useState } from 'react';
import { Col, Card, Table, Tag, Space, Radio } from 'antd';
import { UnorderedListOutlined, FilterOutlined } from '@ant-design/icons';
import { DrugData, FilterType, STATUS_PRIORITY, DRUG_TYPE_MAP } from '../types';

interface DrugDetailsListProps {
  data: DrugData;
}

export const DrugDetailsList: React.FC<DrugDetailsListProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Col span={24}>
        <Card title="รายละเอียดยาทั้งหมด" extra={<UnorderedListOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  // Filter data based on selected filter type
  const getFilteredData = () => {
    switch (filterType) {
      case 'linked':
        return data.filter(item => item.hospital_drug && typeof item.hospital_drug === 'object' && 'name' in item.hospital_drug);
      case 'unlinked':
        return data.filter(item => !item.hospital_drug || typeof item.hospital_drug === 'string');
      case 'all':
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();

  const columns = [
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
      key: 'drugcode',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: 'ชื่อยา',
      dataIndex: ['hospital_drug', 'name'],
      key: 'hospital_drug.name',
      width: 250,
      ellipsis: true,
      render: (name: string, record: any) => {
        if (name) {
          return name;
        }
        return (
          <span style={{ color: '#ff4d4f', fontStyle: 'italic' }}>
            ไม่ได้เชื่อมโยง ({record.drugname})
          </span>
        );
      },
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype',
      key: 'drugtype',
      width: 100,
      render: (drugtype: string) => DRUG_TYPE_MAP[drugtype] || drugtype,
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      width: 100,
      align: 'right' as const,
      render: (remaining: number) => remaining?.toLocaleString() || '0',
    },
    {
      title: 'ใช้ 30 วัน',
      dataIndex: 'issued30day',
      key: 'issued30day',
      width: 100,
      align: 'right' as const,
      render: (issued: number) => issued?.toLocaleString() || '0',
    },
    {
      title: 'อัตราส่วน',
      key: 'ratio',
      width: 120,
      align: 'right' as const,
      render: (record: any) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.ratio.valueString} เดือน
        </span>
      ),
    },
    {
      title: 'วันคงเหลือ',
      key: 'days',
      width: 100,
      align: 'right' as const,
      render: (record: any) => (
        <span>{record.ratio.days} วัน</span>
      ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: 120,
      render: (record: any) => (
        <Tag color={record.ratio.color}>
          {record.ratio.status}
        </Tag>
      ),
    },
    {
      title: 'ราคา/หน่วย',
      key: 'cost',
      width: 120,
      align: 'right' as const,
      render: (record: any) => {
        const cost = record.hospital_drug?.cost;
        return cost ? `${Number(cost).toLocaleString()} บาท` : 'ไม่มีข้อมูล';
      },
    },
    {
      title: 'มูลค่าคงเหลือ',
      key: 'totalValue',
      width: 150,
      align: 'right' as const,
      render: (record: any) => {
        const cost = record.hospital_drug?.cost;
        const remaining = record.remaining;
        if (cost && remaining) {
          const total = Number(cost) * Number(remaining);
          return `${total.toLocaleString()} บาท`;
        }
        return 'ไม่มีข้อมูล';
      },
    },
  ];

  // Sort data by status priority (critical first)
  const sortedData = [...filteredData].sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.ratio.status] || 999;
    const priorityB = STATUS_PRIORITY[b.ratio.status] || 999;
    return priorityA - priorityB;
  });

  // Count statistics
  const linkedCount = data.filter(item => {
    const hd = item.hospital_drug;
    return typeof hd === 'object' && hd !== null && 'name' in hd && Boolean((hd as any).name);
  }).length;
  const unlinkedCount = data.filter(item => {
    const hd = item.hospital_drug;
    return !hd || !(typeof hd === 'object' && hd !== null && 'name' in hd && Boolean((hd as any).name));
  }).length;

  return (
    <Col span={24}>
      <Card
        title={`รายละเอียดยาทั้งหมด`}
        extra={
          <Space>
            <FilterOutlined />
            <Radio.Group
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
            >
              <Radio.Button value="all">
                ทั้งหมด ({data.length})
              </Radio.Button>
              <Radio.Button value="linked">
                เชื่อมโยงแล้ว ({linkedCount})
              </Radio.Button>
              <Radio.Button value="unlinked">
                ยังไม่เชื่อมโยง ({unlinkedCount})
              </Radio.Button>
            </Radio.Group>
          </Space>
        }
      >
        <Table
          dataSource={sortedData}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1200, y: 600 }}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ (แสดง: ${filterType === 'all' ? 'ทั้งหมด' : filterType === 'linked' ? 'เชื่อมโยงแล้ว' : 'ยังไม่เชื่อมโยง'})`,
          }}
          onRow={(record) => ({
            style: {
              backgroundColor:
                record.ratio.status === 'วิกฤต' ? '#fff2f0' :
                  record.ratio.status === 'ต่ำ' ? '#fffbe6' :
                    !record.hospital_drug?.name ? '#f6ffed' :
                      'transparent'
            }
          })}
        />
      </Card>
    </Col>
  );
}; 