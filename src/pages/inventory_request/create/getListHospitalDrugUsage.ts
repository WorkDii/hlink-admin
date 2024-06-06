/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate } from "@tspvivek/refine-directus";
import { directusClient } from "../../../directusClient";

export async function getListHospitalDrugUsage(pcucode: string) {
  const list = await directusClient.request<
    { hospital_drug: string; sum: { unit: string } }[]
  >(
    // @ts-ignore
    aggregate("visitdrug", {
      limit: -1,
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          pcucode: { _eq: pcucode },
          hospital_drug: { _nnull: true },
        },
      },
      aggregate: { sum: ["unit"] },
    })
  );
  return list
    .sort((a, b) => parseInt(b.sum.unit) - parseInt(a.sum.unit))
    .map(({ hospital_drug }) => ({ hospital_drug }));
}
