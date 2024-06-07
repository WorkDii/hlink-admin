/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate, readItem, readItems } from "@tspvivek/refine-directus";
import { directusClient } from "../../../../directusClient";

async function getRate(pcucode: string, hospital_drug: string) {
  const data = await directusClient.request<
    { usage_rate_30_day_ago: number; hospital_drug: string; id: string }[]
  >(
    // @ts-ignore
    readItems("hospital_drug_rate", {
      limit: -1,
      filter: {
        pcucode: {
          _eq: pcucode,
        },
        hospital_drug: {
          _eq: hospital_drug,
        },
      },
    })
  );
  return data[0]?.usage_rate_30_day_ago || 0;
}

async function getUsage(pcucode: string, hospital_drug: string) {
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
          hospital_drug: { _eq: hospital_drug },
        },
      },
      aggregate: { sum: ["unit"] },
    })
  );
  return parseInt(data[0]?.sum?.unit || "0");
}

async function getBought(pcucode: string, hospital_drug: string) {
  const data = await directusClient.request<
    { hospital_drug: string; sum: { quantity: string } }[]
  >(
    // @ts-ignore
    aggregate("inventory_drug", {
      limit: -1,
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          inventory_bill: {
            pcucode: { _eq: pcucode },
          },
          hospital_drug: { _eq: hospital_drug },
        },
      },
      aggregate: { sum: ["quantity"] },
    })
  );

  return parseInt(data[0]?.sum?.quantity || "0");
}

async function getHospitalDrugItem(hospital_drug: string) {
  const data = await directusClient.request<{
    prepack: number;
    default_unit: { id: string; name: string };
  }>(
    // @ts-ignore
    readItem("hospital_drug", hospital_drug, {
      fields: ["*", "default_unit.*"],
    })
  );
  return data;
}

// ต้องการเติมแบบ prepack ให้ใกล้เคียง 60 วันมาที่สุด โดยห้ามน้อยว่า 30 วันเป็นอันขาด (สามารถเกิน 60 วัน ได้ กรณีที่ เศษของจำนวน Prepack น้อยกว่า 50%)
export function getRecommendRequestQuantity({
  current_rate,
  prepack,
  current_remain,
}: {
  current_rate: number;
  current_remain: number;
  prepack: number;
}) {
  const minQuantity = current_rate * 1; // จำนวน "น้อยที่สุด" ที่ต้องการสต็อก คือ 1 เท่าของการใช้ยา 30 วัน
  const expectQuantity = current_rate * 2; // จำนวนที่ "คาดหวัง" ต้องการสต็อก คือ 2 เท่าของการใช้ยา 30 วัน
  const needForExpectQuantity = expectQuantity - current_remain; // จำนวนที่ต้องการเติมเพื่อให้สต็อกครบ

  let _quantity = Math.round(needForExpectQuantity / prepack);
  if (_quantity === 0 && minQuantity > current_remain) _quantity = 1;
  return {
    quantity: _quantity * prepack,
    unit: "000",
    _quantity,
  };
}

export async function getData(pcucode: string, hospital_drug: string) {
  const rate = await getRate(pcucode, hospital_drug);
  const usage = await getUsage(pcucode, hospital_drug);
  const bought = await getBought(pcucode, hospital_drug);
  const hospitalDrugItem = await getHospitalDrugItem(hospital_drug);

  return {
    current_rate: rate,
    current_usage: usage,
    current_remain: bought - usage,
    bought,
    prepack: hospitalDrugItem.prepack,
    default_unit: hospitalDrugItem.default_unit,
    ...getRecommendRequestQuantity({
      current_rate: rate,
      current_remain: bought - usage,
      prepack: hospitalDrugItem.prepack,
    }),
  };
}
