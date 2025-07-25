import React, { useState } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  List, 
  Alert, 
  Table, 
  Spin, 
  Progress,
  Tag
} from 'antd';
import { 
  MedicineBoxOutlined, 
  ShoppingCartOutlined, 
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Pie, Bar } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { useInventoryDashboardData, InventoryDashboardData } from './inventory-dashboard.controller';

const { Title } = Typography;

interface InventoryMetricCardProps {
  title: string;
  value: number;
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

interface InventoryByTypeChartProps {
  data: InventoryDashboardData['inventoryByType'];
}

const InventoryByTypeChart: React.FC<InventoryByTypeChartProps> = ({ data }) => {
  const pieConfig = {
    data,
    angleField: 'totalValue',
    colorField: 'drugtype',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: ฿{value}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <Col span={12}>
      <Card title="มูลค่าคลังยาตามประเภท">
        <Pie {...pieConfig} />
      </Card>
    </Col>
  );
};

interface TopIssuedDrugsChartProps {
  data: InventoryDashboardData['topIssuedDrugs'];
}

const TopIssuedDrugsChart: React.FC<TopIssuedDrugsChartProps> = ({ data }) => {
  const barConfig = {
    data,
    xField: 'issued',
    yField: 'name',
    seriesField: 'drugtype',
    legend: { position: 'top-left' as const },
    barStyle: {
      radius: [0, 4, 4, 0],
    },
  };

  return (
    <Col span={12}>
      <Card title="ยาที่จ่ายมากที่สุด (Top 10)">
        <Bar {...barConfig} />
      </Card>
    </Col>
  );
};

interface StockMovementTableProps {
  data: InventoryDashboardData['stockMovementAnalysis'];
}

const StockMovementTable: React.FC<StockMovementTableProps> = ({ data }) => {
  const columns = [
    {
      title: 'ชื่อยา',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'คงเหลือเริ่มต้น',
      dataIndex: 'beginning',
      key: 'beginning',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'รับเข้า',
      dataIndex: 'received',
      key: 'received',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'จ่ายออก',
      dataIndex: 'issued',
      key: 'issued',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'อัตราหมุนเวียน',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (value: number) => (
        <Progress
          percent={Math.min(value * 100, 100)}
          size="small"
          format={() => `${(value * 100).toFixed(1)}%`}
          strokeColor={value > 0.5 ? '#52c41a' : value > 0.2 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
  ];

  return (
    <Col span={24}>
      <Card title="การเคลื่อนไหวของสต็อก (Top 20)">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="name"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </Col>
  );
};

interface LowStockAlertsProps {
  data: InventoryDashboardData['lowStockAlert'];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ data }) => {
  return (
    <Col span={8}>
      <Card title="แจ้งเตือนสต็อกต่ำ" extra={<WarningOutlined />}>
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Alert
                message={
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    <small>เหลือ: {item.remaining.toLocaleString()} หน่วย</small>
                  </div>
                }
                type={item.status === 'critical' ? 'error' : 'warning'}
                showIcon
                action={
                  <Tag color={item.status === 'critical' ? 'red' : 'orange'}>
                    {item.status === 'critical' ? 'วิกฤต' : 'ต่ำ'}
                  </Tag>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Col>
  );
};

interface InventoryTypeListProps {
  data: InventoryDashboardData['inventoryByType'];
}

const InventoryTypeList: React.FC<InventoryTypeListProps> = ({ data }) => {
  return (
    <Col span={8}>
      <Card title="คลังยาตามประเภท">
        <List
          dataSource={data.slice(0, 8)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.drugtype}
                description={
                  <div>
                    <div>จำนวน: {item.itemCount.toLocaleString()} รายการ</div>
                    <div>มูลค่า: ฿{item.totalValue.toLocaleString()}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Col>
  );
};

interface TurnoverAnalysisProps {
  avgTurnoverRate: number;
}

const TurnoverAnalysis: React.FC<TurnoverAnalysisProps> = ({ avgTurnoverRate }) => {
  const turnoverPercentage = avgTurnoverRate * 100;
  const turnoverStatus = turnoverPercentage > 50 ? 'excellent' : turnoverPercentage > 30 ? 'good' : 'needs-improvement';
  
  return (
    <Col span={8}>
      <Card title="วิเคราะห์อัตราหมุนเวียน">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Progress
            type="circle"
            percent={Math.min(turnoverPercentage, 100)}
            format={() => `${turnoverPercentage.toFixed(1)}%`}
            strokeColor={
              turnoverStatus === 'excellent' ? '#52c41a' :
              turnoverStatus === 'good' ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <Tag
            color={
              turnoverStatus === 'excellent' ? 'green' :
              turnoverStatus === 'good' ? 'orange' : 'red'
            }
            icon={
              turnoverStatus === 'excellent' ? <ArrowUpOutlined /> :
              turnoverStatus === 'good' ? <InfoCircleOutlined /> : <ArrowDownOutlined />
            }
          >
            {turnoverStatus === 'excellent' ? 'ดีเยี่ยม' :
             turnoverStatus === 'good' ? 'ดี' : 'ต้องปรับปรุง'}
          </Tag>
        </div>
      </Card>
    </Col>
  );
};

export const InventoryDashboard: React.FC = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const { data, loading, error } = useInventoryDashboardData(pcucode);

  if (loading) {
    return (
      <div>
        <Title level={2}>แดชบอร์ดคลังยา (จากข้อมูลรายละเอียด)</Title>
        <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Title level={2}>แดชบอร์ดคลังยา (จากข้อมูลรายละเอียด)</Title>
        <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
          <Col>
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error.message}
              type="error"
              showIcon
            />
          </Col>
        </Row>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Title level={2}>แดชบอร์ดคลังยา (จากข้อมูลรายละเอียด)</Title>
        <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
          <Col>
            <Alert
              message="ไม่พบข้อมูล"
              description="กรุณาเลือก PCU เพื่อดูข้อมูล"
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>แดชบอร์ดคลังยา (จากข้อมูลรายละเอียด)</Title>
      <PcuOptionsButton setPcucode={setPcucode} pcucode={pcucode} style={{ marginBottom: 16 }} />
      
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
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
          value={data.totalItems}
          icon={<MedicineBoxOutlined />}
          suffix=" รายการ"
          color="#1890ff"
        />
        <InventoryMetricCard
          title="รายการสต็อกต่ำ"
          value={data.lowStockItems}
          icon={<WarningOutlined />}
          suffix=" รายการ"
          color="#faad14"
        />
        <InventoryMetricCard
          title="รายการหมดสต็อก"
          value={data.stockOutItems}
          icon={<ShoppingCartOutlined />}
          suffix=" รายการ"
          color="#ff4d4f"
        />
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <InventoryByTypeChart data={data.inventoryByType} />
        <TopIssuedDrugsChart data={data.topIssuedDrugs} />
      </Row>

      {/* Analysis Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <LowStockAlerts data={data.lowStockAlert} />
        <InventoryTypeList data={data.inventoryByType} />
        <TurnoverAnalysis avgTurnoverRate={data.avgTurnoverRate} />
      </Row>

      {/* Stock Movement Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <StockMovementTable data={data.stockMovementAnalysis} />
      </Row>
    </div>
  );
};