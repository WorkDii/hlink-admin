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
  Tag,
  Select
} from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { getDrugRatioStatus, getDrugTypeName } from './utils';
import { useInventoryDashboardData } from './hooks';
import { InventoryDashboardData } from './types';

const { Title } = Typography;
const { Option } = Select;

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

interface TotalDrugRatioHistoryChartProps {
  data: InventoryDashboardData['totalDrugRatioHistory'];
}

const TotalDrugRatioHistoryChart: React.FC<TotalDrugRatioHistoryChartProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Col span={12}>
        <Card title="ประวัติอัตราส่วนยาเฉลี่ยรวม" extra={<LineChartOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  const lineConfig = {
    data,
    xField: 'date',
    yField: 'ratio',
    point: {
      size: 5,
      shape: 'diamond',
    },
    yAxis: {
      title: {
        text: 'อัตราส่วนยา (คงเหลือ/การใช้งาน)',
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
    smooth: true,
    animation: false,
    color: '#1890ff',
  };

  return (
    <Col span={12}>
      <Card title="ประวัติอัตราส่วนยาเฉลี่ยรวม" extra={<LineChartOutlined />}>
        <Line {...lineConfig} />
      </Card>
    </Col>
  );
};

interface DrugRatioHistoryByDrugChartProps {
  data: InventoryDashboardData['drugRatioHistoryByDrug'];
}

const DrugRatioHistoryByDrugChart: React.FC<DrugRatioHistoryByDrugChartProps> = ({ data }) => {
  const [selectedDrug, setSelectedDrug] = useState<string>(data.length > 0 ? data[0].drugName : '');

  const selectedDrugData = data.find(drug => drug.drugName === selectedDrug);

  const lineConfig = {
    data: selectedDrugData?.history || [],
    xField: 'date',
    yField: 'drugRatio',
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: (datum: any) => {
      switch (datum.status) {
        case 'critical': return '#ff4d4f';
        case 'low': return '#faad14';
        case 'optimal': return '#52c41a';
        case 'excess': return '#1890ff';
        default: return '#d9d9d9';
      }
    },
    tooltip: {
      showMarkers: true,
      formatter: (datum: any) => [
        { name: 'อัตราส่วนยา', value: datum.drugRatio.toFixed(2) },
        { name: 'คงเหลือ', value: datum.remaining.toLocaleString() },
        { name: 'การใช้งาน 30 วัน', value: datum.issued30day.toLocaleString() },
        {
          name: 'สถานะ', value: datum.status === 'critical' ? 'วิกฤต' :
            datum.status === 'low' ? 'ต่ำ' :
              datum.status === 'optimal' ? 'เหมาะสม' : 'สต็อกเกิน'
        }
      ],
    },
    yAxis: {
      title: {
        text: 'อัตราส่วนยา (คงเหลือ/การใช้งาน)',
      },
    },
    xAxis: {
      title: {
        text: 'วันที่',
      },
    },
  };

  return (
    <Col span={12}>
      <Card
        title="ประวัติอัตราส่วนยาแต่ละรายการ"
        extra={
          <Select
            value={selectedDrug}
            onChange={setSelectedDrug}
            style={{ width: 250 }}
            placeholder="เลือกยา"
          >
            {data.map(drug => (
              <Option key={drug.drugName} value={drug.drugName}>
                {drug.drugName}
              </Option>
            ))}
          </Select>
        }
      >
        <Line {...lineConfig} />
        {selectedDrugData && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Row gutter={16}>
              <Col span={8}>
                <strong>รหัสยา:</strong> {selectedDrugData.drugCode}
              </Col>
              <Col span={8}>
                <strong>ประเภทยา:</strong> {selectedDrugData.drugType}
              </Col>
              <Col span={8}>
                <strong>จำนวนข้อมูล:</strong> {selectedDrugData.history.length} รายการ
              </Col>
            </Row>
          </div>
        )}
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
      width: '20%',
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype_name',
      key: 'drugtype_name',
      width: '15%',
      sorter: (a: any, b: any) => a.drugtype_name.localeCompare(b.drugtype_name),
    },
    {
      title: 'จำนวนคงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (value: string) => Number(value).toLocaleString('th-TH'),
      sorter: (a: any, b: any) => Number(a.remaining) - Number(b.remaining),
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: string) => `฿${Number(value).toLocaleString('th-TH')}`,
      sorter: (a: any, b: any) => Number(a.unitPrice) - Number(b.unitPrice),
    },
    {
      title: 'มูลค่าคงเหลือ',
      dataIndex: 'remainingValue',
      key: 'remainingValue',
      render: (value: string) => `฿${Number(value).toLocaleString('th-TH')}`,
      sorter: (a: any, b: any) => Number(a.remainingValue) - Number(b.remainingValue),
    },
    {
      title: 'ปริมาณการใช้งาน 30 วันย้อนหลัง',
      dataIndex: 'issued30day',
      key: 'issued30day',
      render: (value: string) => Number(value).toLocaleString('th-TH'),
      sorter: (a: any, b: any) => Number(a.issued30day) - Number(b.issued30day),
    },
    {
      title: 'อัตราส่วนยา (คงเหลือ/การใช้งาน)',
      dataIndex: 'drugRatio',
      key: 'drugRatio',
      render: (value: string, record: any) => {
        const ratio = Number(value);
        const issued30day = Number(record.issued30day);

        // กรณีไม่มีการใช้งาน
        if (issued30day === 0) {
          if (record.remaining > 0) {
            return (
              <div>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  ไม่มีการใช้งาน
                </span>
                <br />
                <small style={{ color: '#ff4d4f' }}>
                  มีสต็อก {record.remaining.toLocaleString('th-TH')} หน่วย
                </small>
              </div>
            );
          } else {
            return (
              <div>
                <span style={{ color: '#d9d9d9', fontWeight: 'bold' }}>
                  ไม่มีการใช้งาน
                </span>
                <br />
                <small style={{ color: '#d9d9d9' }}>
                  ไม่มีสต็อก
                </small>
              </div>
            );
          }
        }

        // กรณีมีการใช้งาน
        const { color, status } = getDrugRatioStatus(ratio);

        return (
          <div>
            <span style={{ color, fontWeight: 'bold' }}>
              {ratio.toFixed(2)}
            </span>
            <br />
            <small style={{ color }}>
              {status}
            </small>
          </div>
        );
      },
      sorter: (a: any, b: any) => Number(a.drugRatio) - Number(b.drugRatio),
    },
  ];

  return (
    <Col span={24}>
      <Card title="การเคลื่อนไหวของสต็อก">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="name"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
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
                    <small>เหลือ: {item.remaining.toLocaleString()} หน่วย ({item.reserveRatio.toFixed(1)} วัน)</small>
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

interface DrugRatioSummaryProps {
  data: InventoryDashboardData['totalDrugRatioHistory'];
}

const DrugRatioSummary: React.FC<DrugRatioSummaryProps> = ({ data }) => {
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  if (!latestData) {
    return (
      <Col span={8}>
        <Card title="สรุปสถานะอัตราส่วนยา">
          <Alert message="ไม่พบข้อมูล" type="info" />
        </Card>
      </Col>
    );
  }

  const statusItems = [
    { label: 'วิกฤต', count: latestData.critical, color: '#ff4d4f' },
    { label: 'ต่ำ', count: latestData.low, color: '#faad14' },
    { label: 'เหมาะสม', count: latestData.optimal, color: '#52c41a' },
    { label: 'สต็อกเกิน', count: latestData.excess, color: '#1890ff' },
  ];

  return (
    <Col span={8}>
      <Card title="สรุปสถานะอัตราส่วนยา (วันล่าสุด)">
        <List
          dataSource={statusItems}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.label}</span>
                    <Tag color={item.color} style={{ minWidth: 50, textAlign: 'center' }}>
                      {item.count}
                    </Tag>
                  </div>
                }
                description={`${((item.count / latestData.totalDrungs) * 100).toFixed(2)}% ของยาทั้งหมด`}
              />
            </List.Item>
          )}
        />
        <div style={{ marginTop: 16, textAlign: 'center', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          <strong>อัตราส่วนยาเฉลี่ย: {latestData.ratio.toFixed(2)}</strong>
        </div>
      </Card>
    </Col>
  );
};

interface ReserveAnalysisProps {
  avgReserveRatio: number;
}

const ReserveAnalysis: React.FC<ReserveAnalysisProps> = ({ avgReserveRatio }) => {
  const reserveStatus = avgReserveRatio > 60 ? 'excellent' : avgReserveRatio > 30 ? 'good' : 'needs-improvement';

  return (
    <Col span={8}>
      <Card title="วิเคราะห์อัตราสำรองยา">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Progress
            type="circle"
            percent={Math.min((avgReserveRatio / 90) * 100, 100)}
            format={() => `${avgReserveRatio.toFixed(1)} วัน`}
            strokeColor={
              reserveStatus === 'excellent' ? '#52c41a' :
                reserveStatus === 'good' ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <Tag
            color={
              reserveStatus === 'excellent' ? 'green' :
                reserveStatus === 'good' ? 'orange' : 'red'
            }
            icon={
              reserveStatus === 'excellent' ? <ArrowUpOutlined /> :
                reserveStatus === 'good' ? <InfoCircleOutlined /> : <ArrowDownOutlined />
            }
          >
            {reserveStatus === 'excellent' ? 'ดีเยี่ยม' :
              reserveStatus === 'good' ? 'ดี' : 'ต้องปรับปรุง'}
          </Tag>
        </div>
      </Card>
    </Col>
  );
};

interface DrugsWithoutHospitalDataProps {
  data: InventoryDashboardData['drugsWithoutHospitalData'];
}

const DrugsWithoutHospitalData: React.FC<DrugsWithoutHospitalDataProps> = ({ data }) => {
  const columns = [
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
      key: 'drugcode',
      width: '15%',
    },
    {
      title: 'ชื่อยา',
      dataIndex: 'unitsellname',
      key: 'unitsellname',
      width: '30%',
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype',
      key: 'drugtype',
      width: '15%',
      render: (value: string) => getDrugTypeName(value),
    },
    {
      title: 'จำนวนคงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      width: '15%',
      render: (value: string) => Number(value).toLocaleString('th-TH'),
      sorter: (a: any, b: any) => a.remaining - b.remaining,
    },
    {
      title: 'ปริมาณการใช้งาน 30 วันย้อนหลัง',
      dataIndex: 'issued30day',
      key: 'issued30day',
      width: '15%',
      render: (value: string) => Number(value).toLocaleString('th-TH'),
      sorter: (a: any, b: any) => a.issued30day - b.issued30day,
    },
    {
      title: 'วันที่อัปเดตล่าสุด',
      dataIndex: 'lastUsedDate',
      key: 'lastUsedDate',
      width: '10%',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
    },
  ];

  return (
    <Col span={24}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#faad14' }} />
            รายการยาที่มีการใช้งาน แต่ยังไม่ได้ลิงค์ข้อมูลกับระบบคลังยา
            <Tag color="orange" style={{ marginLeft: 8 }}>
              {data.length} รายการ
            </Tag>
          </div>
        }
      >
        {data.length === 0 ? (
          <Alert
            message="ไม่พบรายการยาที่ต้องลิงค์ข้อมูล"
            description="ยาทั้งหมดมีการลิงค์ข้อมูลกับระบบคลังยาแล้ว"
            type="success"
            showIcon
          />
        ) : (
          <Alert
            message="พบรายการยาที่ต้องลิงค์ข้อมูล"
            description={`มี ${data.length} รายการยาที่มีการใช้งานแต่ยังไม่ได้ลิงค์ข้อมูลกับระบบคลังยา กรุณาตรวจสอบและลิงค์ข้อมูลให้ครบถ้วน`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="drugcode"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          size="small"
        />
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
          title="รายการยาที่ต้องลิงค์ข้อมูล"
          value={data.drugsWithoutHospitalData.length}
          icon={<InfoCircleOutlined />}
          suffix=" รายการ"
          color="#faad14"
        />
      </Row>

      {/* Drug Ratio History Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <TotalDrugRatioHistoryChart data={data.totalDrugRatioHistory} />
        <DrugRatioHistoryByDrugChart data={data.drugRatioHistoryByDrug} />
      </Row>

      {/* Analysis Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <LowStockAlerts data={data.lowStockAlert} />
        <DrugRatioSummary data={data.totalDrugRatioHistory} />
        <ReserveAnalysis avgReserveRatio={data.avgReserveRatio} />
      </Row>

      {/* Drugs Without Hospital Data */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <DrugsWithoutHospitalData data={data.drugsWithoutHospitalData} />
      </Row>

      {/* Stock Movement Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <StockMovementTable data={data.stockMovementAnalysis} />
      </Row>
    </div>
  );
};