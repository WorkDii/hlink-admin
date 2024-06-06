/* eslint-disable @typescript-eslint/ban-ts-comment */
import { aggregate, readItems } from "@tspvivek/refine-directus";
import { directusClient } from "../../../directusClient";

async function getRate(pcucode: string) {
  return directusClient.request<
    { usage_rate_30_day_ago: number; hospital_drug: string; id: string }[]
  >(
    // @ts-ignore
    readItems("hospital_drug_rate", {
      limit: -1,
      filter: {
        pcucode: {
          _eq: pcucode,
        },
      },
    })
  );
}

async function getUsage(pcucode: string) {
  return directusClient.request<
    { hospital_drug: string; sum: { unit: string } }[]
  >(
    // @ts-ignore
    aggregate("visitdrug", {
      limit: -1,
      groupBy: ["hospital_drug"],
      query: {
        filter: {
          pcucode: { _eq: pcucode },
        },
      },
      aggregate: { sum: ["unit"] },
    })
  );
}
async function getBought(pcucode: string) {
  return directusClient.request<
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
        },
      },
      aggregate: { sum: ["quantity"] },
    })
  );
}

function getHospitalDrug(ids: string[]) {
  return directusClient.request<{ id: string; prepack: number }[]>(
    // @ts-ignore
    readItems("hospital_drug", {
      filter: { id: { _in: ids } },
      fields: ["id", "prepack"],
      limit: -1,
    })
  );
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
    unit: prepack,
    _quantity,
  };
}
export async function getRecommendDrug(pcucode: string) {
  const rate = await getRate(pcucode);
  const usage = await getUsage(pcucode);
  const bought = await getBought(pcucode);
  const hospitalDrug = await getHospitalDrug(rate.map((r) => r.hospital_drug));
  const recommend = rate.map((r) => {
    const current_rate = r.usage_rate_30_day_ago;
    const _usage = parseInt(
      usage.find((u) => u.hospital_drug === r.hospital_drug)?.sum.unit || "0"
    );
    const _bought = parseInt(
      bought.find((b) => b.hospital_drug === r.hospital_drug)?.sum.quantity ||
        "0"
    );
    const prepack =
      hospitalDrug.find((h) => h.id === r.hospital_drug)?.prepack || 0;
    return {
      hospital_drug: r.hospital_drug,
      current_rate,
      current_remain: _bought - _usage,
      request_quantity: 1,
      ...getRecommendRequestQuantity({
        current_rate,
        current_remain: _bought - _usage,
        prepack,
      }),
    };
  });
  return recommend;
}
