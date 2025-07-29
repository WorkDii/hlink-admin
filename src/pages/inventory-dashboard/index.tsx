import React, { useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Radio,
} from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  DollarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UnorderedListOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Line, LineConfig } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { useInventoryDashboardData } from './hooks';
import { ComponentLoading } from './component.loading';
import { ComponentError } from './component.error';
import { ComponentEmpty } from './component.empty';
import { valueType } from 'antd/es/statistic/utils';
import { getInventoryDashboardData, STATUS_COLORS } from './hooks.controller';

const { Title } = Typography;

interface InventoryMetricCardProps {
  title: string;
  value: valueType;
  suffix?: string;
  icon: React.ReactNode;
  color?: string;
  precision?: number;
}

const InventoryMetricCard: React.FC<InventoryMetricCardProps> = ({
  title,
  value,
  suffix,
  icon,
  color = '#1890ff',
  precision = 0
}) => (
  <Col span={6}>
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        suffix={suffix}
        precision={precision}
        valueStyle={{ color }}
      />
    </Card>
  </Col>
);

interface DrugDetailsListProps {
  data: Awaited<ReturnType<typeof getInventoryDashboardData>>['drugData'];
}

type FilterType = 'all' | 'linked' | 'unlinked';

const DrugDetailsList: React.FC<DrugDetailsListProps> = ({ data }) => {
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
      render: (drugtype: string) => {
        const typeMap: Record<string, string> = {
          '01': 'ยาแผนปัจจุบัน',
          '04': 'ยา คุมกำเนิด',
          '10': 'ยาสมุนไพร',
        };
        return typeMap[drugtype] || drugtype;
      },
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
  const statusPriority: Record<string, number> = {
    'วิกฤต': 1,
    'ต่ำ': 2,
    'เหมาะสม': 3,
    'เกิน': 4,
    'มากเกินไป': 5
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const priorityA = statusPriority[a.ratio.status] || 999;
    const priorityB = statusPriority[b.ratio.status] || 999;
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

interface StockStatusSummaryProps {
  data: Awaited<ReturnType<typeof getInventoryDashboardData>>['drugStatus'];
}

const STOCK_STATUS_ORDER: Array<keyof typeof STATUS_COLORS> = [
  'วิกฤต',
  'ต่ำ',
  'เหมาะสม',
  'เกิน',
  'มากเกินไป'
];

const StockStatusSummary: React.FC<StockStatusSummaryProps> = ({ data }) => {
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

interface HistoricalDrugRatioChartProps {
  data: Awaited<ReturnType<typeof getInventoryDashboardData>>['historicalDrugRatio'];
}

const HistoricalDrugRatioChart: React.FC<HistoricalDrugRatioChartProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Col span={18}>
        <Card title="ประวัติอัตราการสำรองยา (เดือน)" extra={<LineChartOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  // Transform data for the chart - sort by date and extract value
  const chartData = data
    .map(item => ({
      date: item.date,
      ratio: item.ratio.value
    }))

  const lineConfig: LineConfig = {
    data: chartData,
    xField: 'date',
    yField: 'ratio',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    yAxis: {
      title: {
        text: 'อัตราการสำรองยา (เท่า)',
      },
      min: 0,
    },
    xAxis: {
      title: {
        text: 'วันที่',
      },
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    shapeField: 'smooth',
    animation: false,
    color: '#1890ff',
  };

  return (
    <Col span={18}>
      <Card title="ประวัติอัตราการสำรองยา (เดือน)" extra={<LineChartOutlined />}>
        <Line {...lineConfig} />
      </Card>
    </Col>
  );
};

export const InventoryDashboard: React.FC = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const { data, loading, error } = useInventoryDashboardData(pcucode);


  return <div>
    <Title level={2}>แดชบอร์ดคลังยา (จากข้อมูลรายละเอียด)</Title>
    <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
    {loading && <ComponentLoading />}
    {error && <ComponentError error={error} />}
    {!data && !loading && !error && <ComponentEmpty />}
    {data && !loading && (
      <>
        <Row gutter={[16, 16]}>
          <InventoryMetricCard
            title="อัตราการสำรองยา (เดือน)"
            value={data.totalDrugRatio30Day?.valueString}
            icon={<LineChartOutlined />}
            suffix={`เท่า (${data.totalDrugRatio30Day.status})`}
            color={data.totalDrugRatio30Day.color}
            precision={2}
          />
          <InventoryMetricCard
            title="มูลค่าคลังยารวม"
            value={data.totalInventoryValue}
            icon={<DollarOutlined />}
            suffix=" บาท"
            color="#52c41a"
            precision={2}
          />
          <InventoryMetricCard
            title="จำนวนรายการยารวม"
            value={data.totalItem}
            icon={<MedicineBoxOutlined />}
            suffix=" รายการ"
            color="#1890ff"
          />
          <InventoryMetricCard
            title="จำนวนยาที่มีการใช้งาน แต่ยังไม่ได้ลิงค์ข้อมูลกับระบบคลังยา"
            value={data.drugsWithoutHospitalData?.length || 0}
            icon={<WarningOutlined />}
            suffix=" รายการ"
            color="#faad14"
          />
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <StockStatusSummary data={data.drugStatus} />
          <HistoricalDrugRatioChart data={data.historicalDrugRatio || []} />
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <DrugDetailsList data={data.drugData || []} />
        </Row>
      </>
    )}
  </div>
};