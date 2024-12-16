import { pdf } from "@react-pdf/renderer";
import React from "react";
import { ReportDrug } from "./document";
import { saveAs } from "file-saver";
import { Button } from "antd";
import { FilePdfOutlined, LoadingOutlined } from "@ant-design/icons";
import { getInventoryBillItem } from "../downloadCSV/getInventoryBillItem";

type Props = {
  pcu: string;
  bill_id: string;
  id: string;
  date_created: string;
};
function ReportDownloadButton(props: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const handleDownload = async () => {
    setIsLoading(true);
    const data = await getInventoryBillItem(props.id);
    const blob = await pdf(<ReportDrug data={data} {...props} />).toBlob();
    setIsLoading(false);
    saveAs(blob, `บิลเบิกยา ${props.bill_id}.pdf`);
  };

  return (
    <Button
      type="primary"
      loading={isLoading}
      onClick={handleDownload}
      icon={
        isLoading ? <LoadingOutlined></LoadingOutlined> : <FilePdfOutlined />
      }
    >
      เอกสารบิลเบิกยา
    </Button>
  );
}

export default ReportDownloadButton;
