import { List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Typography } from "antd";
import { getDrugUsedCount } from "./controller";
import { useEffect, useState } from "react";

const { Text } = Typography;

export const InventoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hcode.*"],
    },
    resource: "hospital_drug",
  });
  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();

  const [drugUsedCount, setDrugUsedCount] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    if (!tableProps?.dataSource?.length) return;
    const hospital_drug = tableProps?.dataSource?.map((v) => v.id) as string[];
    getDrugUsedCount(hospital_drug).then((data) => {
      setDrugUsedCount(data);
    });
  }, [tableProps?.dataSource]);
  return (
    <List
      headerProps={{
        title: `${getUserFriendlyName(resource?.name, "plural")}`,
        subTitle: `ปริมาณการใช้งานยาที่ รพซ.สต. ใช้ในการรักษาผู้ป่วย`,
      }}
    >
      <Text type="danger">
        {/* column รพ. อาจจะลบในอนาคต ถ้าแต่ละ รพ. ไม่มีประเด้นเรื่อง code24
        เหมือนกัน แต่ต้องการใช้ชื่อ ต่างกัน หรือประเด็นเรื่องหน่วย
        ที่เข้ากันไม่ได้ ใน v.1 โปรแกรมจะทำการใช้งานหน่วยที่เล็กที่สุด
        เท่านั้นก่อน */}
      </Text>
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
        }}
      >
        <Table.Column dataIndex={["hcode", "name"]} title={"รพ."} sorter />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column
          dataIndex="id"
          title="ปริมาณการใช้"
          render={(v) => {
            return drugUsedCount[v] | 0;
          }}
        />
      </Table>
    </List>
  );
};
