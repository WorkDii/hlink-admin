import { List, useTable } from "@refinedev/antd";
import { Flex, Table, Typography } from "antd";
import BillStatusTag from "../bill_staus";
const { Text } = Typography;
import dayjs from "dayjs";
import DownloadButton from "./downloadButton";
import ReportDownloadButton from "./report/downloadButton";

export interface Ou {
  name: string;
}
export interface InventoryRequestDrug {
  quantity: number;
  hospital_drug: HospitalDrug;
}

export interface HospitalDrug {
  name: string;
  default_unit: {
    name: string;
  };
}

export const InventoryRequestList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: [
        "*",
        "status.*",
        "hcode.name",
        "pcucode.name",
      ],
      deep: {
        inventory_request_drug: {
          _limit: -1,
        },
      },
    },
    sorters: { initial: [{ field: "date_created", order: "desc" }] },
  });
  return (
    <>
      <List
        headerProps={{
          subTitle: "รายการร้องขอยา ของ รพ.สต.",
        }}
      >
        <Text type="secondary"></Text>
        <Table
          {...tableProps}
          rowKey="id"
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
          }}
        >
          <Table.Column dataIndex={"request_id"} title={"เลขที่บิล"} sorter />
          <Table.Column
            dataIndex={"status"}
            title={"สถานะ"}
            sorter
            render={(v: { name: string; id: any }) => {
              return <BillStatusTag {...v}></BillStatusTag>;
            }}
          />
          <Table.Column
            dataIndex={"inventory_request_drug"}
            title={"ยา"}
            sorter
            render={(v: string[]) => {
              return <>{v.length} รายการ</>;
            }}
          />
          <Table.Column dataIndex={["hcode", "name"]} title="รพ." sorter />
          <Table.Column dataIndex={["pcucode", "name"]} title="รพ.สต." sorter />
          <Table.Column
            dataIndex="date_created"
            title="วันที่"
            sorter
            render={(v: string) => dayjs(v).format("DD/MM/YYYY HH:mm:ss")}
          />
          <Table.Column
            dataIndex="id"
            title="action"
            sorter
            render={(id: string, record: any) => {
              return (
                <Flex gap="small">
                  <DownloadButton
                    id={id}
                    request_id={record.request_id}
                  ></DownloadButton>
                  <ReportDownloadButton
                    id={id}
                    pcu={record.pcucode.name}
                    request_id={record.request_id}
                    date_created={record.date_created}
                  ></ReportDownloadButton>
                </Flex>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
