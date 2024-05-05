import { List, useTable } from "@refinedev/antd";
import { Badge, Table } from "antd";

export const UnitList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title={"name"} />
        <Table.Column
          dataIndex="is_active"
          title={"สถานะการใช้งาน"}
          render={(v: boolean) => {
            return v ? (
              <Badge color="green" text="ใช้งาน"></Badge>
            ) : (
              <Badge color="red" text="ไม่ใช้งาน"></Badge>
            );
          }}
        />
      </Table>
    </List>
  );
};
