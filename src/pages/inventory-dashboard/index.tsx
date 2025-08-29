import React, { useState } from 'react';
import { Typography, Row } from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  DollarOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { useInventoryDashboardData } from './hooks';
import { ComponentLoading } from './component.loading';
import { ComponentError } from './component.error';
import { ComponentEmpty } from './component.empty';
import {
  InventoryMetricCard,
  StockStatusSummary,
  HistoricalDrugRatioChart,
  DrugDetailsList
} from './components';

const { Title } = Typography;

export const InventoryDashboard: React.FC = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const { data, loading, error } = useInventoryDashboardData(pcucode);

  return (
    <div>
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
              value={data.totalDrugRatio30Day?.value}
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
  );
};