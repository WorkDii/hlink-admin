import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Typography } from "antd";
import BillStatusTag from "../bill_staus";
const { Text } = Typography;
import dayjs from "dayjs";

export interface Ou {
  name: string;
}
export interface InventoryDrug {
  quantity: number;
  hospital_drug: HospitalDrug;
}

export interface HospitalDrug {
  name: string;
  default_unit: {
    name: string;
  };
}

export const InventoryBillList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: [
        "*",
        "status.*",
        "hcode.*",
        "pcucode.name",
        "inventory_drug.quantity",
        "inventory_drug.hospital_drug.name",
        "inventory_drug.hospital_drug.default_unit.*",
      ],
    },
    sorters: { initial: [{ field: "date_created", order: "desc" }] },
  });
  return (
    <List
      headerProps={{
        subTitle: "รายการการส่งยาให้ รพ.สต.",
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
        <Table.Column dataIndex={"bill_id"} title={"เลขที่บิล"} sorter />
        <Table.Column
          dataIndex={"status"}
          title={"สถานะ"}
          sorter
          render={(v: { name: string; id: any }) => {
            return <BillStatusTag {...v}></BillStatusTag>;
          }}
        />
        <Table.Column
          dataIndex={"inventory_drug"}
          title={"ยา"}
          sorter
          render={(v: InventoryDrug[]) => {
            if (v.length === 0) return "-";
            return v.map((hdrug) => {
              return (
                <Tag>
                  {hdrug.hospital_drug.name} {hdrug.quantity}{" "}
                  {hdrug.hospital_drug.default_unit?.name}
                </Tag>
              );
            });
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
      </Table>
    </List>
  );
};
