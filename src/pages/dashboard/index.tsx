import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, MedicineBoxOutlined, ShoppingCartOutlined, WarningOutlined } from '@ant-design/icons';
import { Typography, Row, Col, Tooltip, Card, Statistic, Progress, List, Alert, Table, Modal, Spin } from 'antd';
import { Bar, Pie, Line as LineChart, Column } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { CurrentStockCard } from './currentStock';
import { GetHospitalDrugStatistic, getHospitalDrugStatistic, useData } from './index.controller';
import { ReorderPointCard } from './reorderPoint';
import { StockOutCard } from './stockOut';
import { DrugReserveRateCard } from './drugReserveRate';
import { DrugRemainingCostCard } from './drugRemainingCost';
import { TopTenDrugCard } from './topTenDrug';
const { Title, Paragraph } = Typography;

// ข้อมูลจำลอง
const mockData = {
  currentStock: 1500,
  reorderPoint: 500,
  expiringItems: 25,
  usageTrend: 10,
  stockOuts: 3,
  totalCost: 50000,
  forecastDemand: 2000,
  topSellingDrugs: [
    { name: "ยา X", sales: 500 },
    { name: "ยา Y", sales: 400 },
    { name: "ยา Z", sales: 300 },
    { name: "ยา W", sales: 200 },
    { name: "ยา V", sales: 100 },
  ],
  lowStockItems: [
    { name: "ยา A", stock: 10 },
    { name: "ยา B", stock: 5 },
    { name: "ยา C", stock: 3 },
  ],
  inventoryTurnover: 4.5,
  supplierPerformance: [
    { name: "ผู้จัดจำหน่าย 1", score: 95 },
    { name: "ผู้จัดจำหน่าย 2", score: 88 },
    { name: "ผู้จัดจำหน่าย 3", score: 92 },
  ],
  drugCategories: [
    { category: "ยาปฏิชีวนะ", value: 30 },
    { category: "ยาแก้ปวด", value: 25 },
    { category: "ยาโรคหัวใจและหลอดเลือด", value: 20 },
    { category: "ยาระบบทางเดินหายใจ", value: 15 },
    { category: "อื่นๆ", value: 10 },
  ],
  expirationTimeline: [
    { date: "2023-06", count: 10 },
    { date: "2023-07", count: 15 },
    { date: "2023-08", count: 20 },
    { date: "2023-09", count: 25 },
    { date: "2023-10", count: 30 },
  ],
  overStockedItems: [
    { name: "ยา X", stock: 1000, recommendedStock: 500 },
    { name: "ยา Y", stock: 800, recommendedStock: 400 },
    { name: "ยา Z", stock: 600, recommendedStock: 300 },
  ],
  stockOutDetails: [
    { id: 1, name: "ยา A", lastStockOutDate: "2023-05-15", frequency: 2, duration: "3 วัน" },
    { id: 2, name: "ยา B", lastStockOutDate: "2023-05-10", frequency: 1, duration: "2 วัน" },
    { id: 3, name: "ยา C", lastStockOutDate: "2023-05-05", frequency: 3, duration: "1 วัน" },
  ],
  topUsedDrugs: [
    { name: "ยา A", usage: 1000 },
    { name: "ยา B", usage: 950 },
    { name: "ยา C", usage: 900 },
    { name: "ยา D", usage: 850 },
    { name: "ยา E", usage: 800 },
    { name: "ยา F", usage: 750 },
    { name: "ยา G", usage: 700 },
    { name: "ยา H", usage: 650 },
    { name: "ยา I", usage: 600 },
    { name: "ยา J", usage: 550 },
  ],
  drugDispensingTrend: [
    { date: '2023-01-01', count: 100 },
    { date: '2023-02-01', count: 120 },
    { date: '2023-03-01', count: 150 },
    { date: '2023-04-01', count: 130 },
    { date: '2023-05-01', count: 160 },
    { date: '2023-06-01', count: 180 },
    { date: '2023-07-01', count: 200 },
    { date: '2023-08-01', count: 220 },
    { date: '2023-09-01', count: 240 },
    { date: '2023-10-01', count: 260 },
    { date: '2023-11-01', count: 280 },
    { date: '2023-12-01', count: 300 },
  ],
};

export const Dashboard: React.FC = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const { data, loading, error, totalDrug, totalReroderPoint, stockOuts, drugRemainingCost } = useData(pcucode)

  // Add this line to calculate the reserve rate (you may need to adjust this calculation based on your actual data)
  const reserveRate = totalDrug / (totalReroderPoint || 1);

  return (
    <>
      <Title level={2}>แดชบอร์ดคลังยา</Title>
      <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
      {loading ? (
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
      ) : error ? (
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
          <Col>
            <Alert
              message="Error"
              description="An error occurred while loading the dashboard data."
              type="error"
              showIcon
            />
          </Col>
        </Row>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <CurrentStockCard totalDrug={totalDrug} />
            <ReorderPointCard totalReorderPoint={totalReroderPoint} />
            <StockOutCard stockOuts={stockOuts} />
            <DrugRemainingCostCard drugRemainingCost={drugRemainingCost} />
            <DrugReserveRateCard pcucode={pcucode} />
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <TopTenDrugCard data={data} />
          </Row>
          {/* Under Development */}
          <div style={{ opacity: 0.4 }}>
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={8}>
                <Tooltip title="มูลค่ารวมของสินค้าคงคลังปัจจุบันตามราคาทุน">
                  <Card title="การวิเคราะห์ต้นทุน">
                    <Statistic
                      title="ต้นทุนสินค้าคงคลังรวม"
                      value={mockData.totalCost}
                      prefix="฿"
                    />
                  </Card>
                </Tooltip>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={8}>
                <Card title="แจ้งเตือนสต็อกต่ำ">
                  <Paragraph>รายการที่ต่ำกว่า 20% ของจุดสั่งซื้อใหม่:</Paragraph>
                  <List
                    dataSource={mockData.lowStockItems}
                    renderItem={(item) => (
                      <List.Item>
                        <Alert message={`${item.name}: เหลือ ${item.stock} หน่วย`} type="warning" showIcon />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Tooltip title="คำนวณจาก: ต้นทุนสินค้าที่ขาย / สินค้าคงเหลือเฉลี่ย ยิ่งสูงยิ่งดี แสดงถึงการจัดการสินค้าคงคลังที่มีประสิทธิภาพ">
                  <Card title="อัตราการหมุนเวียนสินค้าคงคลัง">
                    <Statistic
                      title="อัตราการหมุนเวียนต่อปี"
                      value={mockData.inventoryTurnover}
                      precision={2}
                      valueStyle={{ color: mockData.inventoryTurnover > 4 ? '#3f8600' : '#cf1322' }}
                      suffix="ครั้ง/ปี"
                      prefix={<InfoCircleOutlined />}
                    />
                    <Paragraph>
                      {mockData.inventoryTurnover > 4 ? "อัตราการหมุนเวียนดี" : "ควรปรับปรุงอัตราการหมุนเวียน"}
                    </Paragraph>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Card title="แจ้งเตือนสต็อกเกิน">
                  <Paragraph>รายการที่เกินระดับสต็อกที่แนะนำ:</Paragraph>
                  <List
                    dataSource={mockData.overStockedItems}
                    renderItem={(item) => (
                      <List.Item>
                        <Alert
                          message={`${item.name}: ${item.stock} หน่วย (เกิน ${Math.round((item.stock / item.recommendedStock - 1) * 100)}%)`}
                          type="warning"
                          showIcon
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={24}>
                <Card title="ไทม์ไลน์วันหมดอายุ">
                  <Paragraph>จำนวนรายการที่หมดอายุในแต่ละเดือน:</Paragraph>
                  <LineChart
                    data={mockData.expirationTimeline}
                    xField="date"
                    yField="count"
                    point={{ size: 5, shape: 'diamond' }}
                    label={{ style: { fill: '#aaa' } }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={24}>
                <Card title="แนวโน้มการจ่ายยา">
                  <LineChart
                    data={mockData.drugDispensingTrend}
                    xField="date"
                    yField="count"
                    xAxis={{
                      type: 'time',
                      tickCount: 5,
                    }}
                    yAxis={{
                      title: {
                        text: 'จำนวนการจ่ายยา',
                      },
                    }}
                    tooltip={{
                      formatter: (datum: any) => {
                        return { name: 'จำนวนการจ่ายยา', value: datum.count };
                      },
                    }}
                    point={{
                      size: 5,
                      shape: 'diamond',
                    }}
                    slider={{
                      start: 0,
                      end: 1,
                      trendCfg: {
                        isArea: true,
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
};
