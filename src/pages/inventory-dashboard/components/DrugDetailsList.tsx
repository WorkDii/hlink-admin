import React, { useState, useMemo } from 'react';
import { Col, Card, Table, Tag, Space, Radio, Button, Input } from 'antd';
import { UnorderedListOutlined, FilterOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { DrugData, FilterType, STATUS_PRIORITY, DRUG_TYPE_MAP } from '../types';

interface DrugDetailsListProps {
  data: DrugData;
}

// Utility functions
const isLinkedDrug = (hospitalDrug: any): boolean => {
  return hospitalDrug && typeof hospitalDrug === 'object' && 'name' in hospitalDrug;
};

const getDrugName = (record: any): string => {
  const hospitalDrug = record.hospital_drug;
  if (isLinkedDrug(hospitalDrug)) {
    return (hospitalDrug as any).name;
  }
  return `ไม่ได้เชื่อมโยง`;
};

const getDrugCost = (record: any): number | null => {
  const hospitalDrug = record.hospital_drug;
  return isLinkedDrug(hospitalDrug) ? (hospitalDrug as any).cost : null;
};

const getTotalValue = (record: any): number | null => {
  const cost = getDrugCost(record);
  const remaining = record.remaining;
  return cost && remaining ? Number(cost) * Number(remaining) : null;
};

const formatNumber = (value: number | null | undefined): string => {
  return value?.toLocaleString() || '0';
};

const formatCurrency = (value: number | null | undefined): string => {
  return value ? `${Number(value).toLocaleString()} บาท` : 'ไม่มีข้อมูล';
};

const getFilterTypeLabel = (filterType: FilterType): string => {
  switch (filterType) {
    case 'all': return 'ทั้งหมด';
    case 'linked': return 'เชื่อมโยงแล้ว';
    case 'unlinked': return 'ยังไม่เชื่อมโยง';
    default: return 'ทั้งหมด';
  }
};

const getRowBackgroundColor = (status: string): string => {
  switch (status) {
    case 'วิกฤต': return '#fff2f0';
    case 'ต่ำ': return '#fffbe6';
    case 'เหมาะสม': return '#f0f5ff';
    default: return 'transparent';
  }
};

// CSV Export functionality
const createCSVContent = (data: any[], filterType: FilterType): string => {
  const headers = [
    'รหัสยา',
    'ชื่อยา',
    'ประเภทยา',
    'คงเหลือ',
    'ใช้ 30 วัน',
    'อัตราส่วน (เดือน)',
    'วันคงเหลือ',
    'สถานะ',
    'ราคา/หน่วย (บาท)',
    'มูลค่าคงเหลือ (บาท)'
  ];

  const csvData = data.map(record => [
    record.drugcode,
    getDrugName(record),
    DRUG_TYPE_MAP[record.drugtype || ''] || record.drugtype,
    formatNumber(record.remaining),
    formatNumber(record.issued30day),
    record.ratio.value,
    record.ratio.days,
    record.ratio.status,
    formatCurrency(getDrugCost(record)),
    formatCurrency(getTotalValue(record))
  ]);

  return [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

const downloadCSV = (data: any[], filterType: FilterType): void => {
  const csvContent = createCSVContent(data, filterType);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  const filterLabel = getFilterTypeLabel(filterType);

  link.setAttribute('href', url);
  link.setAttribute('download', `รายละเอียดยา_${filterLabel}_${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const DrugDetailsList: React.FC<DrugDetailsListProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [pageSize, setPageSize] = useState<number>(50);
  const [searchText, setSearchText] = useState<string>('');

  // Early return for empty data
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

  // Memoized computed values
  const { filteredData, linkedCount, unlinkedCount } = useMemo(() => {
    const linkedCount = data.filter(item => isLinkedDrug(item.hospital_drug)).length;
    const unlinkedCount = data.length - linkedCount;

    let filteredData = data;
    switch (filterType) {
      case 'linked':
        filteredData = data.filter(item => isLinkedDrug(item.hospital_drug));
        break;
      case 'unlinked':
        filteredData = data.filter(item => !isLinkedDrug(item.hospital_drug));
        break;
    }

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(item => {
        const drugCode = (item.drugcode || '').toLowerCase();
        const drugName = getDrugName(item).toLowerCase();
        const drugType = (DRUG_TYPE_MAP[item.drugtype || ''] || item.drugtype || '').toLowerCase();
        const status = (item.ratio?.status || '').toLowerCase();

        return drugCode.includes(searchLower) ||
          drugName.includes(searchLower) ||
          drugType.includes(searchLower) ||
          status.includes(searchLower);
      });
    }

    return { filteredData, linkedCount, unlinkedCount };
  }, [data, filterType, searchText]);

  // Sort data by status priority (critical first)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.ratio.status] || 999;
      const priorityB = STATUS_PRIORITY[b.ratio.status] || 999;
      return priorityA - priorityB;
    });
  }, [filteredData]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
      key: 'drugcode',
      width: 100,
      fixed: 'left' as const,
      sorter: (a: any, b: any) => a.drugcode.localeCompare(b.drugcode),
    },
    {
      title: 'ชื่อยา',
      dataIndex: ['hospital_drug', 'name'],
      key: 'hospital_drug.name',
      width: 250,
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
          <span style={{ color: '#ff4d4f', fontStyle: 'italic' }}>
            {name}
          </span>
        );
      },
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype',
      key: 'drugtype',
      width: 100,
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
      width: 100,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.remaining || 0) - (b.remaining || 0),
      render: (remaining: number) => formatNumber(remaining),
    },
    {
      title: 'ใช้ 30 วัน',
      dataIndex: 'issued30day',
      key: 'issued30day',
      width: 100,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.issued30day || 0) - (b.issued30day || 0),
      render: (issued: number) => formatNumber(issued),
    },
    {
      title: 'อัตราส่วน',
      key: 'ratio',
      width: 120,
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
      width: 100,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.ratio.days || 0) - (b.ratio.days || 0),
      render: (record: any) => (
        <span>{record.ratio.days} วัน</span>
      ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: 120,
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
      width: 120,
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
      width: 150,
      align: 'right' as const,
      sorter: (a: any, b: any) => {
        const totalA = getTotalValue(a) || 0;
        const totalB = getTotalValue(b) || 0;
        return totalA - totalB;
      },
      render: (record: any) => formatCurrency(getTotalValue(record)),
    },
  ], []);

  // Pagination configuration
  const paginationConfig = {
    pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    onShowSizeChange: (_current: number, size: number) => setPageSize(size),
    showTotal: (total: number, range: [number, number]) => {
      const searchInfo = searchText.trim() ? ` (ค้นหา: "${searchText}")` : '';
      return `${range[0]}-${range[1]} จาก ${total} รายการ (แสดง: ${getFilterTypeLabel(filterType)})${searchInfo}`;
    },
  };

  return (
    <Col span={24}>
      <Card
        title="รายละเอียดยาทั้งหมด"
        extra={
          <Space>
            <Input
              placeholder="ค้นหายา..."
              prefix={<SearchOutlined />}
              style={{ width: '300px' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
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
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadCSV(sortedData, filterType)}
              size="small"
            >
              ดาวน์โหลด CSV
            </Button>
          </Space>
        }
      >

        <Table
          dataSource={sortedData}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ x: 1200, y: 600 }}
          pagination={paginationConfig}
          onRow={(record: typeof sortedData[0]) => ({
            style: {
              backgroundColor: getRowBackgroundColor(record.ratio.status)
            }
          })}
        />
      </Card>
    </Col>
  );
}; 