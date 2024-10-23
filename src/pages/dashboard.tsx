import React, { useState } from 'react';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, MedicineBoxOutlined, ShoppingCartOutlined, WarningOutlined } from '@ant-design/icons';
import { Typography, Row, Col, Tooltip, Card, Statistic, Progress, List, Alert, Table, Modal } from 'antd';
import { Bar, Pie, Line as LineChart } from '@ant-design/plots';
import PcuOptionsButton from '../components/pcuOptionsButton';
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
};

const expiringItemsData = [
  { key: 1, name: "ยา A", expirationDate: "2023-12-31", quantity: 100 },
  { key: 2, name: "ยา B", expirationDate: "2023-11-30", quantity: 50 },
  { key: 3, name: "ยา C", expirationDate: "2023-10-31", quantity: 75 },
];

const columns = [
  { title: "ชื่อ", dataIndex: "name", key: "name" },
  { title: "วันหมดอายุ", dataIndex: "expirationDate", key: "expirationDate" },
  { title: "จำนวน", dataIndex: "quantity", key: "quantity" },
];

export const Dashboard: React.FC = () => {
  const [isStockOutModalVisible, setIsStockOutModalVisible] = useState(false);

  const showStockOutModal = () => {
    setIsStockOutModalVisible(true);
  };

  const handleStockOutModalClose = () => {
    setIsStockOutModalVisible(false);
  };

  const stockOutColumns = [
    { title: "ชื่อยา", dataIndex: "name", key: "name" },
    { title: "วันที่สินค้าหมดครั้งล่าสุด", dataIndex: "lastStockOutDate", key: "lastStockOutDate" },
    { title: "ความถี่ (30 วันที่ผ่านมา)", dataIndex: "frequency", key: "frequency" },
    { title: "ระยะเวลาเฉลี่ย", dataIndex: "duration", key: "duration" },
  ];

  return (
    <>
      <Title level={2}>แดชบอร์ดคลังยา</Title>
      <PcuOptionsButton setPcucode={() => {}} pcucode={undefined} style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Tooltip title="จำนวนรวมของรายการยาที่มีอยู่ในคลังยา">
            <Card>
              <Statistic
                title="จำนวนรวมของรายการยาที่มีอยู่ในคลังยา"
                value={mockData.currentStock}
                suffix="รายการ"
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip title="ระดับสต็อกที่ควรสั่งซื้อเพิ่ม (มีสต็อกยาน้อยกว่าปริมาณที่คาดการณ์จะใช้ใน 30 วันข้างหน้า)">
            <Card>
              <Statistic
                title="จุดสั่งซื้อใหม่"
                value={mockData.reorderPoint}
                suffix="รายการ"
                valueStyle={{ color: mockData.currentStock <= mockData.reorderPoint ? "#cf1322" : "#3f8600" }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip title="จำนวนรายการที่จะหมดอายุภายใน 30 วันข้างหน้า">
            <Card>
              <Statistic
                title="รายการที่ใกล้หมดอายุ"
                value={mockData.expiringItems}
                suffix="รายการ"
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={8}>
          <Tooltip title="รายการยาที่ไม่มีในคลังยา หรือสต็อกติดลบ">
            <Card title="สินค้าหมด" onClick={showStockOutModal} style={{ cursor: 'pointer' }}>
              <Statistic
                title="จำนวนครั้งที่สินค้าหมด"
                value={mockData.stockOuts}
                valueStyle={{ color: "#cf1322" }}
                prefix={<InfoCircleOutlined />}
              />
              <Paragraph>คลิกเพื่อดูรายละเอียด</Paragraph>
            </Card>
          </Tooltip>
        </Col>
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

      <Modal
        title="รายละเอียดสินค้าหมด"
        visible={isStockOutModalVisible}
        onCancel={handleStockOutModalClose}
        footer={null}
        width={800}
      >
        <Table
          dataSource={mockData.stockOutDetails}
          columns={stockOutColumns}
          pagination={false}
        />
      </Modal>
    </>
  );
};
