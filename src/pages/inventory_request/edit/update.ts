import { directusClient } from "../../../directusClient";
import { updateItem } from "@tspvivek/refine-directus";
import { getRecommendDrug } from "../create/getRecommendDrug";

export type UpdateForm = {
  id: string; // The inventory_request ID
  inventory_drug: Awaited<ReturnType<typeof getRecommendDrug>>[];
};

export async function updateDataInventoryRequest(data: UpdateForm) {
  if (data.inventory_drug.length) {
    return {
      inventory_request_drug: data.inventory_drug.map((item) => ({
        ...item,
        hospital_drug: item.hospital_drug.id,
      })),
    };
  }
  return {
    inventory_request_drug: [],
  };
}


