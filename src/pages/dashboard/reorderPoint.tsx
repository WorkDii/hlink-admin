import { MedicineBoxOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Col, Statistic, Tooltip } from 'antd';
import { directusClient } from '../../directusClient';
import { readItems, aggregate } from "@directus/sdk";
import { useEffect, useState } from 'react';


interface ReorderPointCardProps {
  totalReorderPoint: number;
}

export const ReorderPointCard: React.FC<ReorderPointCardProps> = ({ totalReorderPoint }) => {
  return (
    <Col span={6}>
      <Tooltip title="จำนวนรายการยาที่ควรสั่งซื้อเพิ่ม (มีสต็อกยาน้อยกว่าปริมาณที่คาดการณ์จะใช้ใน 30 วันข้างหน้า)">
        <Card>
          <Statistic
            title="จุดสั่งซื้อใหม่"
            value={totalReorderPoint}
            suffix="รายการ"
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Tooltip>
    </Col>
  );
};