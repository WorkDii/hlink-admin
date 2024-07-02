/* eslint-disable @typescript-eslint/ban-ts-comment */
import { directusClient } from "../../directusClient";
import { readItem } from "@tspvivek/refine-directus";

export interface InventoryRequest {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: null;
  date_updated: null;
  status: string;
  request_id: string;
  hcode: string;
  pcucode: string;
  inventory_request_drug: InventoryRequestDrug[];
}

export interface InventoryRequestDrug {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: null;
  date_updated: null;
  note: null;
  inventory_request: string;
  current_rate: number;
  current_remain: number;
  current_prepack: number;
  quantity: number;
  hospital_drug: HospitalDrug;
}

export interface HospitalDrug {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: string;
  date_updated: Date;
  drugcode24: string;
  name: string;
  is_active: boolean;
  hcode: string;
  default_unit: string;
  ncd_cup: boolean;
  prepack: number;
}

export const getInventoryRequestItem = async (id: string) => {
  const data = await directusClient.request<InventoryRequest>(
    // @ts-ignore
    readItem("inventory_request", id, {
      fields: [
        "*",
        "inventory_request_drug.*",
        "inventory_request_drug.hospital_drug.*",
      ],
    })
  );
  return data.inventory_request_drug
    .map((drug) => ({
      id: drug.id,
      request_id: data.request_id,
      hcode: data.hcode,
      pcucode: data.pcucode,
      hospital_drug_id: drug.hospital_drug.id,
      hospital_drug_name: drug.hospital_drug.name,
      hospital_drug_drugcode24: drug.hospital_drug.drugcode24,
      quantity: drug.quantity,
      current_rate: drug.current_rate,
      current_remain: drug.current_remain,
      current_prepack: drug.current_prepack,
    }))
    .sort((a, b) => b.quantity - a.quantity);
};
