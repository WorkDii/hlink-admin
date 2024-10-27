import { StringChain } from "lodash";
import { directusClient,  } from "../../directusClient";
import { aggregate, readItem, readItems } from "@directus/sdk";
import { HospitalDrug, HospitalDrugRate } from "../../type";


export type GetHospitalDrugStatistic = Awaited<ReturnType<typeof getHospitalDrugStatistic>>
export async function getHospitalDrugStatistic(pcucode: string) { 
  const ou = await directusClient.request<{ date_reset_drug_stock: StringChain, warehouse: {id: number,warehouse_id: string}[] }>(
    // @ts-ignore
    readItem("ou", pcucode, {
      fields: ['date_reset_drug_stock', 'warehouse.*']
    })
  )
  const inventoryDrug = await directusClient.request(
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
        },
      }
    })
  )

  const visitDrug = await directusClient.request(
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
            _gte: ou.date_reset_drug_stock,
          }
        },
      }
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

  const hospitalDrugRate = await directusClient.request<HospitalDrugRate[]>(
    // @ts-ignore
    readItems("hospital_drug_rate", {
      limit: -1,
      filter: {
        pcucode: {
          _eq: pcucode,
        },
      }
    })
  )

  const hospitalDrugWithStatistic = hospitalDrug.map((item) => {
    const inventoryDrugItem = Number(inventoryDrug.find((item2) => item2.hospital_drug === item.id)?.sum.confirm_quantity || 0)
    const visitDrugItem = Number(visitDrug.find((item2) => item2.hospital_drug === item.id)?.sum.unit || 0)
    const usageRate = hospitalDrugRate.find((item2) => item2.hospital_drug === item.id)?.usage_rate_30_day_ago || 0
    const remainingQuantity = inventoryDrugItem - visitDrugItem
    return {
      ...item,
      buy_quantity: inventoryDrugItem,
      used_quantity: visitDrugItem,
      usage_rate_30_day_ago: usageRate,
      remaining_quantity: remainingQuantity,
    }
  })
  return hospitalDrugWithStatistic
}

import { useState, useEffect } from 'react';

export const useData = (pcucode: string | undefined) => {
  const [data, setData] = useState<GetHospitalDrugStatistic>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalDrug, setTotalDrug] = useState(0);
  const [totalReroderPoint, setTotalReroderPoint] = useState(0);
  const [stockOuts, setStockOuts] = useState<GetHospitalDrugStatistic>([]); 
  const [drugRemainingCost, setDrugRemainingCost] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      if (!pcucode) return;
      try {
        setLoading(true);
        const result = await getHospitalDrugStatistic(pcucode);
        setData(result);
        setTotalDrug(result.filter((item) => item.buy_quantity > 0).length)
        setTotalReroderPoint(result.filter((item) => item.remaining_quantity < item.usage_rate_30_day_ago).length)
        setStockOuts(result.filter((item) => item.remaining_quantity < 0))
        setDrugRemainingCost(result.reduce((acc, item) => acc + item.remaining_quantity * Number(item.cost || 0), 0))
      } catch (err) { 
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pcucode]);

  return { data, loading, error, totalDrug, totalReroderPoint, stockOuts, drugRemainingCost };
};
