import { directusClient } from "../../directusClient";
import { readItem } from "@directus/sdk";
import { InventoryBillItem } from "../../type";


export const getInventoryBillItem = async (id: string) => {
  const data = await directusClient.request<InventoryBillItem>(
    // @ts-ignore
    readItem("inventory_bill", id, {
      fields: [
        "*",
        "inventory_drug.*",
        "inventory_drug.hospital_drug.*",
      ],
      deep: {
        inventory_drug: {
          _limit: -1,
        },
      },
    })
  );

  return data.inventory_drug.map((drug) => ({
    id: drug.id,
    bill_id: data.bill_id,
    hcode: data.hcode,
    pcucode: data.pcucode,
    hospital_drug_id: drug.hospital_drug.id,
    hospital_drug_name: drug.hospital_drug.name,
    hospital_drug_drugcode24: drug.hospital_drug.drugcode24,
    h_drugcode: drug.hospital_drug.h_drugcode,
    quantity: drug.quantity,
    warehouse: drug.hospital_drug.warehouse,
    confirm_quantity: drug.confirm_quantity,
    expire_date: drug.expire_date,
    lot_no: drug.lot_no,  
    inventory_request_id: data.inventory_request,
    request_id: data.request_id,  
  }))
  .sort((a, b) => b.quantity - a.quantity);
};