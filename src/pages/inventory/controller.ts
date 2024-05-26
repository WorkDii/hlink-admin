/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate } from "@tspvivek/refine-directus";
import { directusClient } from "../../directusClient";

export async function getDrugUsedCount(hospital_drug?: string[]) {
  if (!hospital_drug?.length) return {};
  const data = await directusClient.request(
    aggregate("visitdrug" as any, {
      aggregate: { count: ["*"] },
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
          ],
        },
      },
    })
  );
  return data.reduce((acc, cur: any) => {
    acc[cur.hospital_drug] = Number(cur.count);
    return acc;
  }, {} as { [key: string]: number });
}

export async function getDrugBoughtCount(hospital_drug?: string[]) {
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

export async function getDrugCount(hospital_drug?: string[]) {
  const bought = await getDrugBoughtCount(hospital_drug);
  const used = await getDrugUsedCount(hospital_drug);

  const _data: {
    [key: string]: { bought: number; used: number; remain: number };
  } = {};
  hospital_drug?.forEach((key) => {
    _data[key] = {
      bought: bought[key] || 0,
      used: used[key] || 0,
      remain: (bought[key] || 0) - (used[key] || 0),
    };
  });

  return _data;
}
