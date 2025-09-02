import React from "react";
import { Button } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const data = await getInventoryRequestItem(id);
      
      // Convert data to CSV format
      const csvHeaders = CSV_COLUMNS.map(col => col.displayName).join(',');
      const csvRows = data.map((row: any) => 
        CSV_COLUMNS.map(col => row[col.id] || '').join(',')
      ).join('\n');
      const csvContent = `${csvHeaders}\n${csvRows}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `inventory_request_${request_id}_${Date.now()}.csv`;
      saveAs(blob, filename);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="default"
      loading={isLoading}
      onClick={handleDownload}
      icon={isLoading ? <LoadingOutlined /> : <DownloadOutlined />}
      title="ดาวน์โหลดข้อมูล CSV"
    >
      ดาวน์โหลด CSV
    </Button>
  );
}
