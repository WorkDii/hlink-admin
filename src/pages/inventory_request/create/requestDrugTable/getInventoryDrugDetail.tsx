import { format } from "date-fns";
import { readInventoryDrugDetailItems, Collections } from "../../../../directus/generated/client";
import { directusClient } from "../../../../directusClient";
import { getRatioData } from "../../../inventory-dashboard/hooks.controller";

export interface LastInventoryDrugDetail {
  issued30day: number;
  remaining: number;
  drugtype: string;
  drugcode: string;
  unitsellcode: string;
  unitsellname: string;
  date: string;
  ratio: ReturnType<typeof getRatioData>;
}

export const getLastInventoryDrugDetail = async (pcucode: string) => {
  const _data: { [key: string]: LastInventoryDrugDetail } = {};

  const lastDate = await directusClient.request(readInventoryDrugDetailItems({
    filter: {
      pcucode: {
        _eq: pcucode
      }
    },
    sort: ["-date"],
    limit: 1,
    fields: ['date']
  })) as { date: string }[];
  if (lastDate.length) {
    const data = await directusClient.request(readInventoryDrugDetailItems({
      filter: {
        pcucode: {
          _eq: pcucode
        },
        date: {
          _eq: lastDate[0].date
        }
      },
      limit: -1
    })) as Collections.InventoryDrugDetail[]
    data.forEach(item => {
      _data[item.drugcode as string] = {
        issued30day: Number(item.issued30day) || 0,
        remaining: Number(item.remaining),
        drugtype: item.drugtype || "",
        drugcode: item.drugcode || "",
        unitsellcode: item.unitsellcode || "",
        unitsellname: item.unitsellname || "",
        date: item.date ? format(item.date, 'yyyy-MM-dd') : "",
        ratio: getRatioData(item.issued30day, item.remaining)
      };
    });
  }
  return _data
}