import { pdf } from "@react-pdf/renderer";
import React from "react";
import { ReportDrug } from "./document";
import { saveAs } from "file-saver";
import { Button } from "antd";
import { FilePdfOutlined, LoadingOutlined } from "@ant-design/icons";
import { getInventoryRequestItem } from "../getInventoryRequestItem";

type Props = {
  pcu: string;
  request_id: string;
  id: string;
  date_created: string;
};
function ReportDownloadButton(props: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const handleDownload = async () => {
    setIsLoading(true);
    const data = await getInventoryRequestItem(props.id);

    const blob = await pdf(<ReportDrug data={data} {...props} />).toBlob();
    setIsLoading(false);
    saveAs(blob, `แบบคำขอเบิกยา ${props.request_id}.pdf`);
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
      เอกสารขอเบิกยา
    </Button>
  );
}

export default ReportDownloadButton;
