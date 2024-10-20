import React, { useState } from 'react';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Typography, Row, Col, Tooltip, Card, Statistic, Progress, List, Alert, Table, Modal } from 'antd';
import { Bar, Pie, Line as LineChart } from '@ant-design/plots';
const { Title, Paragraph } = Typography;

const mockData = {
  currentStock: 1500,
  reorderPoint: 500,
  expiringItems: 25,
  usageTrend: 10,
  stockOuts: 3,
  totalCost: 50000,
  forecastDemand: 2000,
  topSellingDrugs: [
    { name: "Drug X", sales: 500 },
    { name: "Drug Y", sales: 400 },
    { name: "Drug Z", sales: 300 },
    { name: "Drug W", sales: 200 },
    { name: "Drug V", sales: 100 },
  ],
  lowStockItems: [
    { name: "Drug A", stock: 10 },
    { name: "Drug B", stock: 5 },
    { name: "Drug C", stock: 3 },
  ],
  inventoryTurnover: 4.5,
  supplierPerformance: [
    { name: "Supplier 1", score: 95 },
    { name: "Supplier 2", score: 88 },
    { name: "Supplier 3", score: 92 },
  ],
  drugCategories: [
    { category: "Antibiotics", value: 30 },
    { category: "Painkillers", value: 25 },
    { category: "Cardiovascular", value: 20 },
    { category: "Respiratory", value: 15 },
    { category: "Others", value: 10 },
  ],
  expirationTimeline: [
    { date: "2023-06", count: 10 },
    { date: "2023-07", count: 15 },
    { date: "2023-08", count: 20 },
    { date: "2023-09", count: 25 },
    { date: "2023-10", count: 30 },
  ],
  overStockedItems: [
    { name: "Drug X", stock: 1000, recommendedStock: 500 },
    { name: "Drug Y", stock: 800, recommendedStock: 400 },
    { name: "Drug Z", stock: 600, recommendedStock: 300 },
  ],
  stockOutDetails: [
    { id: 1, name: "Drug A", lastStockOutDate: "2023-05-15", frequency: 2, duration: "3 days" },
    { id: 2, name: "Drug B", lastStockOutDate: "2023-05-10", frequency: 1, duration: "2 days" },
    { id: 3, name: "Drug C", lastStockOutDate: "2023-05-05", frequency: 3, duration: "1 day" },
  ],
};

const expiringItemsData = [
  { key: 1, name: "Drug A", expirationDate: "2023-12-31", quantity: 100 },
  { key: 2, name: "Drug B", expirationDate: "2023-11-30", quantity: 50 },
  { key: 3, name: "Drug C", expirationDate: "2023-10-31", quantity: 75 },
];

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Expiration Date", dataIndex: "expirationDate", key: "expirationDate" },
  { title: "Quantity", dataIndex: "quantity", key: "quantity" },
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
    { title: "Drug Name", dataIndex: "name", key: "name" },
    { title: "Last Stock-out Date", dataIndex: "lastStockOutDate", key: "lastStockOutDate" },
    { title: "Frequency (Last 30 days)", dataIndex: "frequency", key: "frequency" },
    { title: "Average Duration", dataIndex: "duration", key: "duration" },
  ];

  return (
    <>
      <Title level={2}>Pharmacy Inventory Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Tooltip title="Total number of items currently in stock across all categories">
            <Card>
              <Statistic
                title="Current Stock Levels"
                value={mockData.currentStock}
                suffix="items"
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip title="The stock level at which a reorder should be triggered. Calculated based on usage patterns and lead times.">
            <Card>
              <Statistic
                title="Reorder Point"
                value={mockData.reorderPoint}
                suffix="items"
                valueStyle={{ color: mockData.currentStock <= mockData.reorderPoint ? "#cf1322" : "#3f8600" }}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip title="Number of items that will expire within the next 30 days">
            <Card>
              <Statistic
                title="Items Expiring Soon"
                value={mockData.expiringItems}
                suffix="items"
                valueStyle={{ color: "#faad14" }}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip title="Percentage change in usage compared to the previous period">
            <Card>
              <Statistic
                title="Usage Trend"
                value={mockData.usageTrend}
                prefix={mockData.usageTrend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix="%"
                valueStyle={{ color: mockData.usageTrend > 0 ? "#3f8600" : "#cf1322" }}
              />
            </Card>
          </Tooltip>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={8}>
          <Tooltip title="Number of times an item was requested but unavailable in the last 30 days">
            <Card title="Stock-outs" onClick={showStockOutModal} style={{ cursor: 'pointer' }}>
              <Statistic
                title="Total Stock-outs"
                value={mockData.stockOuts}
                valueStyle={{ color: "#cf1322" }}
                prefix={<InfoCircleOutlined />}
              />
              <Paragraph>Click for details</Paragraph>
            </Card>
          </Tooltip>
        </Col>
        <Col span={8}>
          <Tooltip title="Total value of current inventory at cost price">
            <Card title="Cost Analysis">
              <Statistic
                title="Total Inventory Cost"
                value={mockData.totalCost}
                prefix="$"
              />
            </Card>
          </Tooltip>
        </Col>
        <Col span={8}>
          <Card title="Forecast Demand">
            <Tooltip title="Predicted demand for the next 30 days based on historical data and trends">
              <Statistic value={mockData.forecastDemand} suffix="items" prefix={<InfoCircleOutlined />} />
            </Tooltip>
            <Paragraph>Current stock vs Forecast:</Paragraph>
            <Progress
              percent={Math.round((mockData.currentStock / mockData.forecastDemand) * 100)}
              status="active"
              style={{ marginTop: "10px" }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <Card title="Top Selling Drugs">
            <Paragraph>Sales volume in the last 30 days:</Paragraph>
            <Bar
              data={mockData.topSellingDrugs}
              xField="sales"
              yField="name"
              seriesField="name"
              legend={false}
              barBackground={{ style: { fill: 'rgba(0,0,0,0.1)' } }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Drug Category Distribution">
            <Paragraph>Percentage of inventory by category:</Paragraph>
            <Pie
              data={mockData.drugCategories}
              angleField="value"
              colorField="category"
              radius={0.8}
              label={{ type: 'outer' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={8}>
          <Card title="Low Stock Alerts">
            <Paragraph>Items below 20% of their reorder point:</Paragraph>
            <List
              dataSource={mockData.lowStockItems}
              renderItem={(item) => (
                <List.Item>
                  <Alert message={`${item.name}: ${item.stock} units left`} type="warning" showIcon />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Tooltip title="Calculated as: Cost of Goods Sold / Average Inventory. Higher is generally better, indicating efficient inventory management.">
            <Card title="Inventory Turnover">
              <Statistic
                title="Annual Turnover Ratio"
                value={mockData.inventoryTurnover}
                precision={2}
                valueStyle={{ color: mockData.inventoryTurnover > 4 ? '#3f8600' : '#cf1322' }}
                suffix="times/year"
                prefix={<InfoCircleOutlined />}
              />
              <Paragraph>
                {mockData.inventoryTurnover > 4 ? "Good turnover rate" : "Turnover rate needs improvement"}
              </Paragraph>
            </Card>
          </Tooltip>
        </Col>
        <Col span={8}>
          <Card title="Over Stock Alerts">
            <Paragraph>Items exceeding recommended stock levels:</Paragraph>
            <List
              dataSource={mockData.overStockedItems}
              renderItem={(item) => (
                <List.Item>
                  <Alert
                    message={`${item.name}: ${item.stock} units (${Math.round((item.stock / item.recommendedStock - 1) * 100)}% over)`}
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
          <Card title="Expiration Date Timeline">
            <Paragraph>Number of items expiring each month:</Paragraph>
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
          <Card title="Supplier Performance">
            <Paragraph>Based on delivery time, order accuracy, and quality:</Paragraph>
            <Table
              dataSource={mockData.supplierPerformance}
              columns={[
                { title: 'Supplier', dataIndex: 'name', key: 'name' },
                { title: 'Score', dataIndex: 'score', key: 'score' },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Stock-out Details"
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
