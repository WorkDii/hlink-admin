import React, { useState } from 'react';
import { Card, Col, Modal, Statistic, Table, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
  import { GetHospitalDrugStatistic, } from './index.controller';
  

const { Paragraph } = Typography;

interface StockOutCardProps {
  stockOuts: GetHospitalDrugStatistic  ;
}

export const StockOutCard: React.FC<StockOutCardProps> = ({ stockOuts }) => {
  const [isStockOutModalVisible, setIsStockOutModalVisible] = useState(false);

  const handleStockOutModalClose = () => {
    setIsStockOutModalVisible(false);
  };

  const showStockOutModal = () => {
    setIsStockOutModalVisible(true);
  };

  const stockOutColumns = [
    { title: "รายการยา", dataIndex: "name", key: "name" },
    { title: "ปริมาณการใช้ 30 วัน", dataIndex: "usage_rate_30_day_ago", key: "usage_rate_30_day_ago" },
    {
      title: "ปริมาณคงเหลือ",
      dataIndex: "remaining_quantity",
      key: "remaining_quantity"
    }
  ];

  return (
    <>
      <Modal
        title="รายละเอียดสินค้าหมด"
        visible={isStockOutModalVisible}
        onCancel={handleStockOutModalClose}
        footer={null}
        width={800}
      >
        <Table
          dataSource={stockOuts.map(item => {
            return {
              name: item.name,
              usage_rate_30_day_ago: item.usage_rate_30_day_ago,
              remaining_quantity: item.remaining_quantity 
            }
          })}
          columns={stockOutColumns}
          pagination={false}
        />
      </Modal>
    <Col span={6}>
      <Tooltip title="รายการยาที่ไม่มีในคลังยา หรือสต็อกติดลบ">
        <Card  onClick={showStockOutModal} style={{ cursor: 'pointer' }}>
          <Statistic
            title="สินค้าหมด หรือติดลบ"
            value={stockOuts.length}
            valueStyle={{ color: "#cf1322" }}
              prefix={<InfoCircleOutlined />}
              suffix="รายการ"
            />
        </Card>
      </Tooltip>
      </Col>
      
    </>
  );
};
