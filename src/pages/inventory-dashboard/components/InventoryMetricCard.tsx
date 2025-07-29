import React from 'react';
import { Col, Card, Statistic } from 'antd';
import { valueType } from 'antd/es/statistic/utils';

interface InventoryMetricCardProps {
  title: string;
  value: valueType;
  suffix?: string;
  icon: React.ReactNode;
  color?: string;
  precision?: number;
}

export const InventoryMetricCard: React.FC<InventoryMetricCardProps> = ({
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