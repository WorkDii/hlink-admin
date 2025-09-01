import { format } from "date-fns";
import { readInventoryDrugDetailItems, Collections } from "../../../../directus/generated/client"
import { directusClient } from "../../../../directusClient"
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
  const _data: { [key: string]: LastInventoryDrugDetail } = {}

  const lastDate = await directusClient.request(readInventoryDrugDetailItems({
    filter: {
      pcucode: {
        _eq: pcucode
      }
    },
    sort: ["-date"],
    limit: 1,
    fields: ['date']
  })) as { date: string }[]
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
    data.forEach(i => {
      _data[i.drugcode as string] = {
        issued30day: i.issued30day || 0,
        remaining: i.remaining,
        drugtype: i.drugtype || "",
        drugcode: i.drugcode || "",
        unitsellcode: i.unitsellcode || "",
        unitsellname: i.unitsellname || "",
        date: i.date ? format(i.date, 'yyyy-MM-dd') : "",
        ratio: getRatioData(i.issued30day, i.remaining)
      }
    })
  }
  return _data
}