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
    confirm_quantity: drug.confirm_quantity,
    inventory_request_id: data.inventory_request,
    request_id: data.request_id,
  }))
};