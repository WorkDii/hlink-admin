import CsvDownloader from "react-csv-downloader";
import { getInventoryRequestItem } from "./getInventoryRequestItem";

interface Props {
  id: string;
  request_id: string;
}

const CSV_COLUMNS = [
  { displayName: "id", id: "id" },
  { displayName: "inventory_request_id", id: "inventory_request_id" },
  { displayName: "request_id", id: "request_id" },
  { displayName: "hcode", id: "hcode" },
  { displayName: "pcucode", id: "pcucode" },
  { displayName: "hospital_drug_id", id: "hospital_drug_id" },
  { displayName: "hospital_drug_name", id: "hospital_drug_name" },
  { displayName: "hospital_drug_drugcode24", id: "hospital_drug_drugcode24" },
  { displayName: "h_drugcode", id: "h_drugcode" },
  { displayName: "quantity", id: "quantity" },
  { displayName: "current_rate", id: "current_rate" },
  { displayName: "current_remain", id: "current_remain" },
  { displayName: "current_prepack", id: "current_prepack" },
];

export default function DownloadButton({ id, request_id }: Props) {
  const handleDownload = async () => {
    return await getInventoryRequestItem(id);
  };

  const filename = `inventory_request_${request_id}_${Date.now()}.csv`;

  return (
    <CsvDownloader
      text="ดาวน์โหลดข้อมูล CSV"
      datas={handleDownload}
      filename={filename}
      columns={CSV_COLUMNS}
    />
  );
}
