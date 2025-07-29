import React, { useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  DollarOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line, LineConfig } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { useInventoryDashboardData } from './hooks';
import { ComponentLoading } from './component.loading';
import { ComponentError } from './component.error';
import { ComponentEmpty } from './component.empty';
import { valueType } from 'antd/es/statistic/utils';
import { getInventoryDashboardData } from './hooks.controller';

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

interface HistoricalDrugRatioChartProps {
  data: Awaited<ReturnType<typeof getInventoryDashboardData>>['historicalDrugRatio'];
}

const HistoricalDrugRatioChart: React.FC<HistoricalDrugRatioChartProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Col span={24}>
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
    <Col span={24}>
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
          <HistoricalDrugRatioChart data={data.historicalDrugRatio || []} />
        </Row>


      </>
    )}
  </div>
};