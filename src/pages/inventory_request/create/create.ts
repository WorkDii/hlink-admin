/* eslint-disable @typescript-eslint/ban-ts-comment */
import { readItems } from "@tspvivek/refine-directus";
import {
  INVENTORY_DRUG_REQUEST_BILL_ID,
  PENDING_STATUS,
} from "../../../contexts/constants";
import { directusClient } from "../../../directusClient";
import { getRecommendDrug } from "./getRecommendDrug";

export type From = {
  hcode: string;
  pcucode: string;
  inventory_drug: Awaited<ReturnType<typeof getRecommendDrug>>;
  hospital_drug_selected: string[];
  bill_warehouse: string;
};
export function generateRequestID(pcucode: string, lastBillID?: string) {
  const NUM_DIGIT = 4;
  const year = new Date().getFullYear().toString().slice(-2);
  const billIndex = lastBillID ? parseInt(lastBillID.slice(-NUM_DIGIT)) + 1 : 1;
  return `${INVENTORY_DRUG_REQUEST_BILL_ID}${pcucode}${year}${billIndex
    .toString()
    .padStart(NUM_DIGIT, "0")}`;
}

export async function createDataInventoryRequest(data: From) {
  if (data.inventory_drug.length) {
    const lastRequestID = await getLatestRequestID(data);
    const billID = generateRequestID(data.pcucode, lastRequestID);
    return {
      request_id: billID,
      pcucode: data.pcucode,
      hcode: data.hcode,
      status: PENDING_STATUS,
      inventory_request_drug: data.inventory_drug.map((i) => ({
        ...i,
        hospital_drug: i.hospital_drug.id,
      })),
      bill_warehouse: data.bill_warehouse,
    };
  }
}
async function getLatestRequestID(data: From) {
  const _data = await directusClient.request<{ request_id: string }[]>(
    // @ts-ignore
    readItems("inventory_request", {
      limit: 1,
      filter: {
        pcucode: {
          _eq: data.pcucode,
        },
      },
      fields: ["id", "request_id"],
      sort: ["-request_id"],
    })
  );
  return _data[0]?.request_id;
}
