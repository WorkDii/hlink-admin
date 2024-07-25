/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate } from "@tspvivek/refine-directus";
import { directusClient } from "../../directusClient";
import { getPcuDateResetDrugStock } from "../../controller/dateResetDrug";

async function getDrugUsedCount(
  hospital_drug?: string[],
  pcucode?: string,
  dateResetDrugStock?: string
) {
  if (!hospital_drug?.length) return {};
  const data = await directusClient.request(
    aggregate("visitdrug" as any, {
      aggregate: { sum: ["unit"] },
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          // @ts-ignore
          _and: [
            {
              hospital_drug: {
                _in: hospital_drug,
              },
            },
            pcucode
              ? {
                  pcucode: {
                    _eq: pcucode,
                  },
                }
              : {},
            dateResetDrugStock
              ? {
                  dateupdate: {
                    _gte: dateResetDrugStock,
                  },
                }
              : {},
          ],
        },
      },
    })
  );

  return data.reduce((acc, cur: any) => {
    acc[cur.hospital_drug] = Number(cur.sum.unit);
    return acc;
  }, {} as { [key: string]: number });
}

async function getDrugBoughtCount(
  hospital_drug?: string[],
  pcucode?: string,
  dateResetDrugStock?: string
) {
  if (!hospital_drug?.length) return {};
  const data = await directusClient.request(
    aggregate("inventory_drug" as any, {
      aggregate: { sum: ["quantity"] },
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          // @ts-ignore
          _and: [
            {
              hospital_drug: {
                _in: hospital_drug,
              },
            },
            pcucode
              ? {
                  inventory_bill: {
                    pcucode: {
                      _eq: pcucode,
                    },
                  },
                }
              : {},
            dateResetDrugStock
              ? {
                  date_created: {
                    _gte: dateResetDrugStock,
                  },
                }
              : {},
          ],
        },
      },
    })
  );

  return data.reduce((acc, cur: any) => {
    acc[cur.hospital_drug] = Number(cur.sum.quantity);
    return acc;
  }, {} as { [key: string]: number });
}

export async function getDrugCount(hospital_drug?: string[], pcucode?: string) {
  const dateResetDrugStock = await getPcuDateResetDrugStock(pcucode);
  const bought = await getDrugBoughtCount(
    hospital_drug,
    pcucode,
    dateResetDrugStock
  );
  const used = await getDrugUsedCount(
    hospital_drug,
    pcucode,
    dateResetDrugStock
  );

  const _data: {
    [key: string]: {
      bought: number;
      used: number;
      remain: number;
      dateResetDrugStock?: string;
    };
  } = {};
  hospital_drug?.forEach((key) => {
    _data[key] = {
      bought: bought[key] || 0,
      used: used[key] || 0,
      remain: (bought[key] || 0) - (used[key] || 0),
    };
  });

  return {
    data: _data,
    dateResetDrugStock,
  };
}
