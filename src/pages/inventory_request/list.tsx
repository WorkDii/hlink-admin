import { List, useTable } from "@refinedev/antd";
import { Flex, Table } from "antd";
import dayjs from "dayjs";
import BillStatusTag from "../bill_staus";
import DownloadButton from "./downloadButton";
import ReportDownloadButton from "./report/downloadButton";

interface InventoryRequestDrug {
  quantity: number;
  hospital_drug: HospitalDrug;
}

interface HospitalDrug {
  name: string;
  default_unit: {
    name: string;
  };
}

interface StatusType {
  name: string;
  id: "pending" | "canceled" | "completed" | "in progress";
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
            render={(status: StatusType) => (
              <BillStatusTag {...status} />
            )}
          />
          <Table.Column
            dataIndex={"inventory_request_drug"}
            title={"ยา"}
            sorter
            render={(drugs: InventoryRequestDrug[]) => (
              <>{drugs.length} รายการ</>
            )}
          />
          <Table.Column dataIndex={["hcode", "name"]} title="รพ." sorter />
          <Table.Column dataIndex={["bill_warehouse"]} title="สถานที่เบิกยา" sorter />
          <Table.Column dataIndex={["pcucode", "name"]} title="รพ.สต." sorter />
          <Table.Column
            dataIndex="date_created"
            title="วันที่"
            sorter
            render={(date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss")}
          />
          <Table.Column
            dataIndex="id"
            title="action"
            sorter
            render={(id: string, record: any) => (
              <Flex gap="small">
                <DownloadButton
                  id={id}
                  request_id={record.request_id}
                />
                <ReportDownloadButton
                  id={id}
                  pcu={record.pcucode.name}
                  request_id={record.request_id}
                  date_created={record.date_created}
                />
              </Flex>
            )}
          />
        </Table>
      </List>
    </>
  );
};
