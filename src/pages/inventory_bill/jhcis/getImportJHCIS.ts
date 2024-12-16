import { directusClient } from "../../../directusClient";
import { getInventoryBillItem } from "../downloadCSV/getInventoryBillItem";
import { readItems } from "@directus/sdk";
import dayjs from "dayjs";
import { Cdrug } from "../../../type";
export const getImportJHCIS = async (id: string) => {
  const data = await getInventoryBillItem(id);
  // @ts-ignore
  const cdrug = await directusClient.request<Cdrug[]>(readItems('cdrug', {
    filter: {
    pcucode: data[0].pcucode
    }, limit: -1
  })
  )
  return data.map((item) => {
    const c = cdrug.find((cdrug) => cdrug.drugcode24 === item.hospital_drug_drugcode24);
    return {
      pcucode: item.pcucode,
      blank: "",
      tmtcode: c?.tmtcode,
      lot_no: item.lot_no || '-',
      expire_date: dayjs(item.expire_date).format('YYYY-MM-DD'),
      pack_amount: item.confirm_quantity/item.pack_ratio,
      pack_unit: c?.lotunit || c?.unitsell,
      pack_price: parseFloat(item.cost)/(item.confirm_quantity/item.pack_ratio),
      count_in_pack: item.pack_ratio,
      unit_used: c?.packunit || c?.unitusage || "???",
    };
  });
};
