import React, { useEffect, useState } from 'react';
import { Card, Statistic, Tooltip, Col, DatePicker } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { directusClient } from '../../directusClient';
import { aggregate, readItem, readItems } from '@directus/sdk';
import { HospitalDrug } from '../../type';
interface DrugReserveRateCardProps {
  pcucode?: string;
}


interface InventoryDrug {
  hospital_drug: string;
  sum: {
    confirm_quantity: string;
  }
}

interface VisitDrug {
  hospital_drug: string;
  sum: {
    unit: string;
  }
}

async function getDrugReserveRate(pcucode: string, date: Dayjs) {

  const ou = await directusClient.request<{ date_reset_drug_stock: string, warehouse: { id: number, warehouse_id: string }[] }>(
    // @ts-ignore
    readItem("ou", pcucode, {
      // @ts-ignore
      fields: ['date_reset_drug_stock', 'warehouse.*']
    })
  )

  const hospitalDrug = await directusClient.request<HospitalDrug[]>(
    // @ts-ignore
    readItems("hospital_drug", {
      limit: -1,
      filter: {
        warehouse: {
          _in: ou.warehouse.map((item) => item.warehouse_id)
        }
      }
    })
  )
  const costDrug: Record<string, number> = {}
  hospitalDrug.forEach((item) => {
    costDrug[item.id] = Number(item.cost)
  })

  const inventoryDrug = await directusClient.request<InventoryDrug[]>(
    // @ts-ignore
    aggregate("inventory_drug", {
      aggregate: {
        sum: ['confirm_quantity']
      },
      groupBy: ['hospital_drug'],
      query: {
        limit: -1,
        filter: {
          inventory_bill: {
            pcucode: {
              _eq: pcucode,
            },
          },
          date_created: {
            _gte: ou.date_reset_drug_stock,
            // สต็อกยา ก่อนวันที่ตรวจสอบ
            _lte: date.format('YYYY-MM-DD'),
          },
        },
      }
    })
  )

  const inventoryDrugCost = inventoryDrug.reduce((acc, item) => {
    return acc + (costDrug[item.hospital_drug] * Number(item.sum.confirm_quantity || 0))
  }, 0)

  const visitDrug1Month = await directusClient.request<VisitDrug[]>(
    // @ts-ignore
    aggregate("visitdrug", {
      aggregate: {
        sum: ['unit']
      },
      groupBy: ['hospital_drug'],
      query: {
        limit: -1,
        filter: {
          pcucode: {
            _eq: pcucode,
          },
          dateupdate: {
            _gte: date.subtract(1, 'months').isBefore(dayjs(ou.date_reset_drug_stock)) ? ou.date_reset_drug_stock : date.subtract(1, 'months').format('YYYY-MM-DD'),
          },
          hospital_drug: {
            _in: hospitalDrug.map((item) => item.id)
          }
        },
      }
    })
  )

  const visitDrug1MonthCost = visitDrug1Month.reduce((acc, item) => {
    return acc + (costDrug[item.hospital_drug]) * Number(item.sum.unit || 0)
  }, 0)

  const visitDrug = await directusClient.request<VisitDrug[]>(
    // @ts-ignore
    aggregate("visitdrug", {
      aggregate: {
        sum: ['unit']
      },
      groupBy: ['hospital_drug'],
      query: {
        limit: -1,
        filter: {
          pcucode: {
            _eq: pcucode,
          },
          dateupdate: {
            _lte: date.format('YYYY-MM-DD'),
            _gte: ou.date_reset_drug_stock,
          },
          hospital_drug: {
            _in: hospitalDrug.map((item) => item.id)
          }
        },
      }
    })
  )

  const visitDrugCost = visitDrug.reduce((acc, item) => {
    return acc + costDrug[item.hospital_drug] * Number(item.sum.unit)
  }, 0)

  return (inventoryDrugCost - visitDrugCost) / visitDrug1MonthCost;
}
export const DrugReserveRateCard: React.FC<DrugReserveRateCardProps> = ({ pcucode }) => {
  const [reserveRate, setReserveRate] = useState(0);
  const [date, setDate] = useState(dayjs());
  const isGoodRate = reserveRate >= 1 && reserveRate <= 2;

  useEffect(() => {
    if (pcucode && date) {
      getDrugReserveRate(pcucode, date).then(setReserveRate);
    }
  }, [pcucode, date]);
  return (
    <Col span={8}>
      <Tooltip title="มูลค่ายาคงเหลือทั้งหมดใน รพ.สต. / มูลค่าที่ใช้ไปใน 30 วันที่ผ่านมา">
        <Card>
          <Statistic
            title={
              <div>
                อัตราการสำรองยา ณ วันที่
                <DatePicker
                  style={{ marginBottom: 16, width: '100%' }}
                  onChange={(date) => {
                    setDate(date);
                  }}
                  defaultValue={date}
                  placeholder="เลือกวันที่"
                  format="DD/MM/YYYY"
                />

              </div>
            }
            value={reserveRate.toFixed(2)}
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
