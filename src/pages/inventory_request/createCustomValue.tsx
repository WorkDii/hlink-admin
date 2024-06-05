import { DataProvider } from "@refinedev/core";
import dayjs from "dayjs";

export async function getBillId(dataProvider: DataProvider, hcode: string) {
  const bill = await dataProvider.getList({
    resource: "inventory_bill",
    filters: [{ field: "hcode", operator: "eq", value: hcode }],
    meta: {
      noStatus: true,
      fields: ["bill_id"],
    },
    sorters: [{ field: "bill_id", order: "desc" }],
    pagination: { pageSize: 1 },
  });
  if (bill.data.length === 0) {
    return hcode + dayjs().format("YY") + "00001";
  } else {
    const lastIndex = bill.data[0].bill_id.split("/")[0].slice(-5);
    const newId = parseInt(lastIndex) + 1;
    return hcode + dayjs().format("YY") + newId.toString().padStart(5, "0");
  }
}
