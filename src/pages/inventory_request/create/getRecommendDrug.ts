/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate, readItems } from "@tspvivek/refine-directus";
import { directusClient } from "../../../directusClient";
import { getRecommendRequestQuantity } from "./getRecommendRequestQuantity";
import { PREPACK_UNIT_ID } from "../../../contexts/constants";

export interface HospitalDrug {
  id: string;
  drugcode24: string;
  name: string;
  ncd_cup: boolean;
  prepack: number;
  default_unit: DefaultUnit;
}

export interface DefaultUnit {
  id: string;
  name: string;
}

export interface TempRecommendObject {
  [key: string]: {
    current_rate: number;
    hospital_drug: HospitalDrug;
    usage?: number;
    bought?: number;
  };
}

async function getInitialData(pcucode: string, fix_hospital_drug?: string) {
  const data = await directusClient.request<
    { usage_rate_30_day_ago: number; hospital_drug: HospitalDrug; id: string }[]
  >(
    // @ts-ignore
    readItems("hospital_drug_rate", {
      limit: -1,
      filter: {
        pcucode: {
          _eq: pcucode,
        },
        ...(fix_hospital_drug
          ? { hospital_drug: { _eq: fix_hospital_drug } }
          : {}),
      },
      fields: [
        "id",
        "usage_rate_30_day_ago",
        "hospital_drug.*",
        "hospital_drug.default_unit.*",
      ],
    })
  );

  // if fix_hospital_drug is provided and no data found, return minimal data set
  // fix_hospital_drug is used to get the data for the specific hospital_drug
  // this is used when the user is change the hospital_drug
  if (fix_hospital_drug && data.length === 0) {
    const hospital_drug = await directusClient.request<HospitalDrug[]>(
      // @ts-ignore
      readItems("hospital_drug", {
        limit: 1,
        filter: {
          id: {
            _eq: fix_hospital_drug,
          },
        },
        fields: ["*", "default_unit.*"],
      })
    );

    return {
      [fix_hospital_drug]: {
        current_rate: 0,
        hospital_drug: hospital_drug[0],
      },
    };
  } else {
    const obj: {
      [key: string]: { current_rate: number; hospital_drug: HospitalDrug };
    } = {};
    data.forEach((d) => {
      obj[d.hospital_drug.id] = {
        current_rate: d.usage_rate_30_day_ago,
        hospital_drug: d.hospital_drug,
      };
    });
    return obj;
  }
}

async function getUsage(pcucode: string, obj: TempRecommendObject) {
  const data = await directusClient.request<
    { hospital_drug: string; sum: { unit: string } }[]
  >(
    // @ts-ignore
    aggregate("visitdrug", {
      limit: -1,
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          pcucode: { _eq: pcucode },
          hospital_drug: { _in: Object.keys(obj) },
        },
      },
      aggregate: { sum: ["unit"] },
    })
  );
  data.forEach((d) => {
    if (obj[d.hospital_drug]) {
      obj[d.hospital_drug].usage = parseInt(d.sum.unit);
    }
  });
  return obj;
}
async function getBought(pcucode: string, obj: TempRecommendObject) {
  const data = await directusClient.request<
    { hospital_drug: string; sum: { quantity: string } }[]
  >(
    // @ts-ignore
    aggregate("inventory_drug", {
      limit: -1,
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          hospital_drug: { _in: Object.keys(obj) },
          inventory_bill: {
            pcucode: { _eq: pcucode },
          },
        },
      },
      aggregate: { sum: ["quantity"] },
    })
  );
  data.forEach((d) => {
    if (obj[d.hospital_drug]) {
      obj[d.hospital_drug].bought = parseInt(d.sum.quantity);
    }
  });
  return obj;
}

export async function getRecommendDrug(
  pcucode: string,
  fix_hospital_drug?: string
) {
  const recommendObject = await getInitialData(pcucode, fix_hospital_drug);
  const usage = await getUsage(pcucode, recommendObject);
  const bought = await getBought(pcucode, usage);
  const recommend = Object.keys(recommendObject).map((key) => {
    const r = recommendObject[key];
    const _usage = usage[key]?.usage || 0;
    const _bought = bought[key]?.bought || 0;
    const prepack = r.hospital_drug.prepack;
    return {
      hospital_drug: r.hospital_drug,
      current_rate: r.current_rate,
      current_remain: _bought - _usage,
      current_usage: _usage,
      current_bought: _bought,
      unit: PREPACK_UNIT_ID,
      ...getRecommendRequestQuantity({
        current_rate: r.current_rate,
        current_remain: _bought - _usage,
        prepack,
      }),
    };
  });
  return recommend;
}
