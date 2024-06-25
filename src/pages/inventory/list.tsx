import { List, useTable } from "@refinedev/antd";
import { Table, Typography } from "antd";
import { getDrugCount } from "./controller";
import { useEffect, useState } from "react";
import PcuOptionsButton from "../../components/pcuOptionsButton";

const { Text } = Typography;

export const InventoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hcode.*"],
    },
    resource: "hospital_drug",
  });
  const [drugCount, setDrugCount] = useState<{
    [key: string]: {
      bought: number;
      used: number;
      remain: number;
    };
  }>({});

  const [pcucode, setPcucode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!tableProps?.dataSource?.length) return;
    const hospital_drug = tableProps?.dataSource?.map((v) => v.id) as string[];
    getDrugCount(hospital_drug, pcucode).then((data) => {
      setDrugCount(data);
    });
  }, [tableProps?.dataSource, pcucode]);
  return (
    <List
      headerProps={{
        subTitle: `ปริมาณการใช้งานยาที่ รพ.สต. ใช้ในการรักษาผู้ป่วย`,
      }}
    >
      <PcuOptionsButton
        pcucode={pcucode}
        setPcucode={setPcucode}
        style={{ marginBottom: 16 }}
      ></PcuOptionsButton>
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
