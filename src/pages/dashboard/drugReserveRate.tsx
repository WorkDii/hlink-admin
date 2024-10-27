import React from 'react';
import { Card, Statistic, Tooltip, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DrugReserveRateCardProps {
  reserveRate: number;
}

export const DrugReserveRateCard: React.FC<DrugReserveRateCardProps> = ({ reserveRate }) => {
  const isGoodRate = reserveRate >= 1.5 && reserveRate <= 2.5;

  return (
    <Col span={6}>  
    <Tooltip title="มูลค่ายาคงเหลือทั้งหมดใน รพ.สต. / มูลค่าที่ใช้ไปใน 30 วันที่ผ่านมา">
      <Card>
        <Statistic
          title="อัตราการสำรองยา"
          value={reserveRate}
          precision={2}
          valueStyle={{ color: isGoodRate ? '#3f8600' : '#cf1322' }}
          prefix={<InfoCircleOutlined />}
          suffix="เท่า"
          />
      </Card>
      </Tooltip>
    </Col>
  );
};
