import { List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Typography } from "antd";
import { getDrugCount } from "./controller";
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
  const [drugCount, setDrugCount] = useState<{
    [key: string]: {
      bought: number;
      used: number;
      remain: number;
    };
  }>({});

  useEffect(() => {
    if (!tableProps?.dataSource?.length) return;
    const hospital_drug = tableProps?.dataSource?.map((v) => v.id) as string[];
    getDrugCount(hospital_drug).then((data) => {
      setDrugCount(data);
    });
  }, [tableProps?.dataSource]);

  return (
    <List
      headerProps={{
        title: `${getUserFriendlyName(resource?.name, "plural")}`,
        subTitle: `ปริมาณการใช้งานยาที่ รพซ.สต. ใช้ในการรักษาผู้ป่วย`,
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
        <Table.Column dataIndex={["hcode", "name"]} title={"รพ."} sorter />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column
          dataIndex="id"
          title="จำนวนที่ซื้อ"
          render={(v) => {
            return drugCount?.[v]?.bought | 0;
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="ปริมาณการใช้"
          render={(v) => {
            return drugCount?.[v]?.used | 0;
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="จำนวนคงเหลือ"
          render={(v) => {
            const amount = drugCount?.[v]?.remain;
            if (amount < 0) {
              return <Text type="danger">{amount}</Text>;
            }
            return amount;
          }}
          fixed="right"
        />
      </Table>
    </List>
  );
};
