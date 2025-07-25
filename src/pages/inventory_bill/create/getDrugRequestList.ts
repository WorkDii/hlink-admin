import { readItem } from "@tspvivek/refine-directus"
import { directusClient } from "../../../directusClient";
import { InventoryRequest } from "../../../type";
export const getDrugRequestList = async (request_id: string) => {
  const data = await directusClient.request<InventoryRequest>(
    readItem("inventory_request", request_id, {
      fields: [
        "*",
        {
          inventory_request_drug: [
            "*",
            {
              hospital_drug: [
                "*",
                {
                  default_unit: ["*"]
                }
              ]
            }
          ]
        }
      ],
    })
  );
  return data;
};
