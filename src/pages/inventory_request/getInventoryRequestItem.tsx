/* eslint-disable @typescript-eslint/ban-ts-comment */
import { directusClient } from "../../directusClient";
import { readItem } from "@tspvivek/refine-directus";
import { InventoryRequest } from "../../type";


export const getInventoryRequestItem = async (id: string) => {
  const data = await directusClient.request<InventoryRequest>(
    readItem("inventory_request", id, {
      fields: [
        "*",
        {
          inventory_request_drug: [
            "*",
            {
              hospital_drug: ["*"]
            }
          ]
        }
      ],
      limit: -1,
      deep: {
        inventory_request_drug: {
          _limit: -1,
        },
      },
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
      h_drugcode: drug.hospital_drug.h_drugcode,
      quantity: drug.quantity,
      current_rate: drug.current_rate,
      current_remain: drug.current_remain,
      current_prepack: drug.current_prepack,
    }))
    .sort((a, b) => b.quantity - a.quantity);
};
