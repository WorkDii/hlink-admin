import { MedicineBoxOutlined } from '@ant-design/icons';
import { Card, Col, Statistic, Tooltip } from 'antd';
import { directusClient } from '../../directusClient';
import { readItems, aggregate } from "@directus/sdk";
import { useEffect, useState } from 'react';


interface DrugRemainingCostCardProps {
  drugRemainingCost: number;
}
export const DrugRemainingCostCard: React.FC<DrugRemainingCostCardProps> =  ({ drugRemainingCost }) => {
 
  return (
    <Col span={6}>
          <Tooltip title="มูลค่ารวมของยาคงคลังปัจจุบัน (ตามราคาทุนของยาตัวนั้น ณ ปัจจุบัน)">
            <Card>
              <Statistic
                title="มูลค่ารวมของยาคงคลัง"
                value={drugRemainingCost.toFixed(2)}
                suffix="บาท"
                prefix={'฿'}
              />
            </Card>
          </Tooltip>
        </Col>
  );
};