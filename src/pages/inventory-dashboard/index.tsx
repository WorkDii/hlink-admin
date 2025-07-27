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
  Tag,
  Select
} from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import PcuOptionsButton from '../../components/pcuOptionsButton';
import { getDrugRatioStatus, getDrugTypeName, getStockStatusWithColors, formatReserveRatioInMonths } from './utils';
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
    <Col span={24}>
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
    <Col span={16}>
      <Card
        title="ประวัติอัตราส่วนยาแต่ละรายการ (Top 50)"
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

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
      title: 'สถานะสต็อก (เดือนคงเหลือ)',
      dataIndex: 'reserveRatio',
      key: 'reserveRatio',
      render: (value: string, record: any) => {
        const reserveRatio = Number(value);
        const issued30day = Number(record.issued30day);

        if (issued30day === 0) {
          if (record.remaining > 0) {
            return <span style={{ color: '#ff4d4f' }}>ไม่มีการใช้งาน (มีสต็อก {record.remaining.toLocaleString('th-TH')} หน่วย)</span>;
          } else {
            return <span style={{ color: '#d9d9d9' }}>ไม่มีการใช้งาน (ไม่มีสต็อก)</span>;
          }
        }

        const { color, status } = getStockStatusWithColors(reserveRatio);
        return <span style={{ color }}>{formatReserveRatioInMonths(reserveRatio)} ({status})</span>;
      },
      sorter: (a: any, b: any) => Number(a.reserveRatio) - Number(b.reserveRatio),
    },
  ];

  return (
    <Col span={24}>
      <Card title="การเคลื่อนไหวของสต็อก">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="name"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: 'default',
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize || 20,
              });
            },
            onShowSizeChange: (current, size) => {
              setPagination({
                current: 1,
                pageSize: size,
              });
            },
          }}
          scroll={{ x: 1200 }}
          size="middle"
          loading={false}
          bordered
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
        <Card title="สรุปสถานะสต็อก">
          <Alert message="ไม่พบข้อมูล" type="info" />
        </Card>
      </Col>
    );
  }

  const statusItems = [
    { label: 'วิกฤต', count: latestData.critical, color: '#ff4d4f', threshold: '< 7 วัน' },
    { label: 'ต่ำ', count: latestData.low, color: '#faad14', threshold: '7-30 วัน' },
    { label: 'เหมาะสม', count: latestData.optimal, color: '#52c41a', threshold: '1-3 เดือน' },
    { label: 'สต็อกเกิน', count: latestData.excess, color: '#1890ff', threshold: '≥ 3 เดือน' },
  ];

  return (
    <Col span={6}>
      <Card title="สรุปสถานะสต็อก (วันล่าสุด)">
        <List
          dataSource={statusItems}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span>{item.label}</span>
                      <div style={{ fontSize: '10px', color: '#999' }}>{item.threshold}</div>
                    </div>
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



interface DrugsWithoutHospitalDataProps {
  data: InventoryDashboardData['drugsWithoutHospitalData'];
}

const DrugsWithoutHospitalData: React.FC<DrugsWithoutHospitalDataProps> = ({ data }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

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
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ['5', '10', '20', '50'],
            size: 'default',
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize || 10,
              });
            },
            onShowSizeChange: (current, size) => {
              setPagination({
                current: 1,
                pageSize: size,
              });
            },
          }}
          scroll={{ x: 1000 }}
          size="small"
          loading={false}
          bordered
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

      {/* Total Drug Ratio History Chart - Full Width */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <TotalDrugRatioHistoryChart data={data.totalDrugRatioHistory} />
      </Row>

      {/* Drug Ratio by Drug Chart and Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <DrugRatioHistoryByDrugChart data={data.drugRatioHistoryByDrug} />
        <DrugRatioSummary data={data.totalDrugRatioHistory} />
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