import { List, useTable, BooleanField } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Typography } from "antd";

const { Text } = Typography;

const TrueIcon = () => <span>✅</span>;

const FalseIcon = () => <span>❌</span>;

export const HospitalDrugList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "default_unit.*", "hcode.name"],
    },
  });
  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  return (
    <List
      headerProps={{
        title: `${getUserFriendlyName(resource?.name, "plural")}`,
        subTitle: `รายกการยาของโรงพยาบาลแม่ข่าย`,
      }}
    >
      <Text type="danger">
        column รพ. อาจจะลบในอนาคต ถ้าแต่ละ รพ. ไม่มีประเด้นเรื่อง code24
        เหมือนกัน แต่ต้องการใช้ชื่อ ต่างกัน หรือประเด็นเรื่องหน่วย
        ที่เข้ากันไม่ได้ ใน v.1 โปรแกรมจะทำการใช้งานหน่วยที่เล็กที่สุด
        เท่านั้นก่อน
      </Text>
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
        }}
      >
        <Table.Column
          dataIndex={"hcode"}
          title={"รพ."}
          sorter
          render={(v) => {
            return <Text>{v.name}</Text>;
          }}
        />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column
          dataIndex={["default_unit", "name"]}
          title={"หน่วย"}
          sorter
        />
        <Table.Column
          dataIndex={"ncd_cup"}
          title={"NCD_CUP"}
          sorter
          align="center"
          render={(value) => (
            <BooleanField
              value={value}
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
            />
          )}
        />
        <Table.Column dataIndex={"prepack"} title={"PREPACK"} sorter />
      </Table>
    </List>
  );
};
