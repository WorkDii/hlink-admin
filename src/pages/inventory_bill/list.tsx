import { List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Typography } from "antd";
import BillStatusTag from "../bill_staus";
const { Text } = Typography;
import dayjs from "dayjs";

export interface Ou {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: null;
  date_updated: null;
  name: string;
}
export const InventoryBillList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "status.*", "hcode.*", "pcucode.*"],
    },
    sorters: { initial: [{ field: "date_created", order: "desc" }] },
  });
  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  console.log(tableProps);
  return (
    <List
      headerProps={{
        title: `${getUserFriendlyName(resource?.name, "plural")}`,
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
          dataIndex="hcode"
          title="รพ."
          sorter
          render={(v: Ou) => {
            return <Text>{`${v.name}`}</Text>;
          }}
        />
        <Table.Column
          dataIndex="pcucode"
          title="รพ.สต."
          sorter
          render={(v: Ou) => {
            return <Text>{`${v.name}`}</Text>;
          }}
        />
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
