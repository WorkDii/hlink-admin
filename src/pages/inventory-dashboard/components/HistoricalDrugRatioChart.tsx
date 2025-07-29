import React from 'react';
import { Col, Card } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line, LineConfig } from '@ant-design/plots';
import { HistoricalDrugRatio } from '../types';

interface HistoricalDrugRatioChartProps {
  data: HistoricalDrugRatio;
}

export const HistoricalDrugRatioChart: React.FC<HistoricalDrugRatioChartProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Col span={18}>
        <Card title="ประวัติอัตราการสำรองยา (เดือน)" extra={<LineChartOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  // Transform data for the chart - sort by date and extract value
  const chartData = data
    .map(item => ({
      date: item.date,
      ratio: item.ratio.value
    }))

  const lineConfig: LineConfig = {
    data: chartData,
    xField: 'date',
    yField: 'ratio',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    yAxis: {
      title: {
        text: 'อัตราการสำรองยา (เท่า)',
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
    shapeField: 'smooth',
    animation: false,
    color: '#1890ff',
  };

  return (
    <Col span={18}>
      <Card title="ประวัติอัตราการสำรองยา (เดือน)" extra={<LineChartOutlined />}>
        <Line {...lineConfig} />
      </Card>
    </Col>
  );
}; 