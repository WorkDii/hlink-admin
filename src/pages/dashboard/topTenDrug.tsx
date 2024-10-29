import { MedicineBoxOutlined } from '@ant-design/icons';
import { Card, Col, Statistic, Tooltip } from 'antd';
import { directusClient } from '../../directusClient';
import { readItems, aggregate } from "@directus/sdk";
import { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { GetHospitalDrugStatistic, OuWithWarehouse, useOu } from './index.controller';
import { HospitalDrug } from '../../type';


interface TopTenDrugCardProps {
  data: GetHospitalDrugStatistic
}


export const TopTenDrugCard: React.FC<TopTenDrugCardProps> = ({ data }) => {
  const [topTenDrug, setTopTenDrug] = useState<{ name: string, cost: string }[]>([])
  useEffect(() => {
    if (data.length > 0) {
      const topTenDrug = data.map((item) => ({
        name: item.name,
        cost: (Number(item.cost || 0) * Number(item.buy_quantity || 0)).toFixed()
      })).sort((a, b) => Number(b.cost) - Number(a.cost)).slice(0, 10)
      setTopTenDrug(topTenDrug)
    }
  }, [data])
  return (
    <Col span={24}>
      <Card title="10 อันดับมูลค่ายา ที่มีการใช้งานสูงสุด">
        <Column
          data={topTenDrug}
          xField="name"
          yField="cost"
          axis={{
            x: {
              labelFormatter: (text: string) => {
                return text.length > 15 ? text.substring(0, 15) + '...' : text;
              }
            }
          }}

        />
      </Card>
    </Col>
  );
};