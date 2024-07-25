/* eslint-disable @typescript-eslint/ban-ts-comment */
import { readItem } from "@tspvivek/refine-directus";
import { directusClient } from "../directusClient";

export async function getPcuDateResetDrugStock(pcucode?: string) {
  if (!pcucode) return undefined;
  const data = await directusClient.request<{ date_reset_drug_stock?: string }>(
    // @ts-ignore
    readItem("ou", pcucode)
  );
  return data.date_reset_drug_stock;
}
