import { MedicineBoxOutlined } from '@ant-design/icons';
import { Card, Col, Statistic, Tooltip } from 'antd';
import { directusClient } from '../../directusClient';
import { readItems, aggregate } from "@directus/sdk";
import { useEffect, useState } from 'react';


interface CurrentStockCardProps {
  totalDrug: number;
}
export const CurrentStockCard: React.FC<CurrentStockCardProps> =  ({ totalDrug }) => {
 
  return (
    <Col span={6}>
          <Tooltip title="จำนวนรวมของรายการยาที่มีอยู่ในคลังยา">
            <Card>
              <Statistic
                title="จำนวนรวมของรายการยาที่มีอยู่ในคลังยา"
                value={totalDrug}
                suffix="รายการ"
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Tooltip>
        </Col>
  );
};