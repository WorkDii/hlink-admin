import { readItems, updateItem } from "@tspvivek/refine-directus";
import {
  INVENTORY_BILL_ID,
  COMPLETED_STATUS,
} from "../../../contexts/constants";
import { directusClient } from "../../../directusClient";

import { InventoryRequestDrug } from "../../../type";
import { DatePickerProps } from "antd";

export type From = {
  inventory_request: string,
  pcucode: string,
  hcode: string,
  bill_warehouse: string,
  request_id: string,
  inventory_request_drug: (InventoryRequestDrug & {
    expiry_date: DatePickerProps['value'],
    lot_number?: string,
    cost: number,
  })[]
};

export function generateBillID(pcucode: string, lastBillID?: string) {
  const NUM_DIGIT = 4;
  const year = new Date().getFullYear().toString().slice(-2);
  const billIndex = lastBillID ? parseInt(lastBillID.slice(-NUM_DIGIT)) + 1 : 1;
  return `${INVENTORY_BILL_ID}${pcucode}${year}${billIndex
    .toString()
    .padStart(NUM_DIGIT, "0")}`;
}

export async function createDataInventoryBill(data: From) {
  if (data.inventory_request_drug.length) {
    const lastBillID = await getLatestBillID(data);
    const billID = generateBillID(data.pcucode, lastBillID);
    return {
      bill_id: billID,
      pcucode: data.pcucode,
      hcode: data.hcode,
      status: COMPLETED_STATUS,
      bill_warehouse: data.bill_warehouse,
      request_id: data.request_id,
      inventory_request: data.inventory_request,
      inventory_drug: data.inventory_request_drug.map((i) => ({
        quantity: i.quantity,
        hospital_drug: i.hospital_drug.id,
        expire_date: i.expiry_date?.format('YYYY-MM-DD'),
        lot_no: i.lot_number,
        cost: i.cost,
        pack_ratio: i.current_prepack,
      })),
    };
  }
}
async function getLatestBillID(data: From) {
  const _data = await directusClient.request<{ bill_id: string }[]>(
    // @ts-ignore
    readItems("inventory_bill", {
      limit: 1,
      filter: {
        pcucode: {
          _eq: data.pcucode,
        },
        bill_id: {
          _starts_with: INVENTORY_BILL_ID
        }
      },
      fields: ["id", "bill_id"],
      sort: ["-bill_id"],
    })
  );
  return _data[0]?.bill_id;
}

export async function updateInventoryRequestStatus(request_id: string) {
  await directusClient.request(updateItem("inventory_request", request_id, {
    status: COMPLETED_STATUS,
  }));
}