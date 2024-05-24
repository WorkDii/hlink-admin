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
