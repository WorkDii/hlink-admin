/* eslint-disable @typescript-eslint/ban-ts-comment */
import CsvDownloader from "react-csv-downloader";
import { getInventoryBillItem } from "./getInventoryBillItem";

type Props = {
  id: string;
  bill_id: string;
};

const columns = [
  { displayName: "id", id: "id" },
  {
    bill_id: "bill_id", id: "bill_id"
  },
  { displayName: "hcode", id: "hcode" },
  { displayName: "pcucode", id: "pcucode" },
  { displayName: "hospital_drug_id", id: "hospital_drug_id" },
  { displayName: "hospital_drug_name", id: "hospital_drug_name" },
  { displayName: "hospital_drug_drugcode24", id: "hospital_drug_drugcode24" },
  { displayName: "h_drugcode", id: "h_drugcode" },
  { displayName: "quantity", id: "quantity" },
  { displayName: "confirm_quantity", id: "confirm_quantity" },
  { displayName: "expire_date", id: "expire_date" },
  { displayName: "lot_no", id: "lot_no" },
  { displayName: "inventory_request_id", id: "inventory_request_id" },
  { displayName: "request_id", id: "request_id" },
];

export default function DownloadButton({ id, bill_id }: Props) {
  return (
    <CsvDownloader
      text="ดาวน์โหลดข้อมูล CSV"
      datas={async () => {
        return (await getInventoryBillItem(id)) as any;
      }}
      filename={`invertory_bill_${bill_id}_${new Date().getTime()}.csv`}
      columns={columns}
    />
  );
}
