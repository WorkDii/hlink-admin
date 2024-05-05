import { List, useTable } from "@refinedev/antd";
import { Badge, Table, Typography } from "antd";

const { Text } = Typography;

export const UnitList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List headerButtons>
      <Text type="warning">
        กรุณาแจ้ง admin เพื่อเพิ่มหน่วย, user ไม่สามารถเพิ่มหน่วยได้ด้วยตนเอง
      </Text>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title={"ชื่อ"} />
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
