import { directusClient } from "../../../directusClient";
import { getInventoryBillItem } from "../downloadCSV/getInventoryBillItem";
import dayjs from "dayjs";
import { Cdrug } from "../../../type";
import { readItems } from "@tspvivek/refine-directus";


export const getImportJHCIS = async (id: string) => {
  const data = await getInventoryBillItem(id);
  // @ts-ignore
  const cdrug = await directusClient.request<Cdrug[]>(readItems('cdrug', {
    filter: {
      pcucode: data[0].pcucode
    }, limit: -1
  })
  )
  return data.sort((a, b) => a.hospital_drug_name > b.hospital_drug_name ? 1 : -1).map((item) => {
    const c = cdrug.find((cdrug) => cdrug.drugcode24 === item.hospital_drug_drugcode24);
    return {
      pcucode: item.pcucode,
      blank: "",
      tmtcode: c?.tmtcode,
      lot_no: item.lot_no || '-',
      expire_date: dayjs(item.expire_date).format('YYYY-MM-DD'),
      pack_amount: item.confirm_quantity / item.pack_ratio,
      pack_unit: c?.lotunit || c?.unitsell,
      pack_price: parseFloat(item.cost) / (item.confirm_quantity / item.pack_ratio),
      count_in_pack: item.pack_ratio,
      unit_used: c?.packunit || c?.unitusage || "???",
      drug_name: c?.drugname,
      drug_code: c?.drugcode,
      drug_code24: c?.drugcode24,
      hospital_drug_name: item.hospital_drug_name,
      hospital_drug_drugcode24: item.hospital_drug_drugcode24,
    };
  });
};

