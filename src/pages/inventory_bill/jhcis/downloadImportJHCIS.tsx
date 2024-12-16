/* eslint-disable @typescript-eslint/ban-ts-comment */
import CsvDownloader from "react-csv-downloader";
import { getImportJHCIS } from "./getImportJHCIS";

type Props = {
  id: string;
  bill_id: string;
};

const columns = [
  { displayName: "pcucode", id: "pcucode" },
  { displayName: "ปล่อยว่าง", id: "blank" },
  { displayName: "tmtcode", id: "tmtcode" },
  { displayName: "lot number", id: "lot_no" },
  { displayName: "expired date", id: "expire_date" },
  { displayName: "จำนวนรับ (หน่วยบรรจุ)", id: "pack_amount" },
  { displayName: "รหัสหน่วยบรรจุ", id: "pack_unit" },
  { displayName: "ราคาต่อ 1 หน่วยบรรจุ", id: "pack_price" },
  { displayName: "จำนวนนับใน 1 หน่วยบรรจุ", id: "count_in_pack" },
  { displayName: "หน่วยนับ (ใช้ในคลังนอก)", id: "unit_used" },

];

export default function DownloadImportJHCIS({ id, bill_id }: Props) {
  return (
    <CsvDownloader
      text="นำเข้า JHCIS"
      datas={getImportJHCIS(id) as any}
      filename={`invertory_bill_${bill_id}_${new Date().getTime()}.csv`}
      columns={columns}
    />
  );
}
