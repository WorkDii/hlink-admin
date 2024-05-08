import { List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Tag, Typography } from "antd";
import _ from "lodash";

const { Text } = Typography;

export interface HospitalDrug {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: string;
  date_updated: Date;
  drugcode24: string;
  name: string;
  is_active: boolean;
  hcode: string;
  default_unit: Unit;
}
export interface Unit {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: null;
  date_updated: null;
  name: string;
  is_active: boolean;
  name_eng: string;
}
export const HospitalDrugUnitList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: [
        "*",
        "hcode.name",
        "unit.*",
        "hospital_drug.*",
        "hospital_drug.default_unit.*",
      ],
    },
  });
  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  console.log(tableProps);
  return (
    <List
      title={`${getUserFriendlyName(
        resource?.name,
        "plural"
      )} (รายการหน่วยของยาที่ใช้งานในโรงพยาบาลนั้นๆ  เช่น 100008190003471120381546 มีการใช้งานหน่วยเม็ดและกระปุก เป็นต้น)`}
    >
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
        <Table.Column
          dataIndex="hospital_drug"
          title="ยา"
          sorter
          render={(v: HospitalDrug) => {
            return (
              <Text>{`[${v.drugcode24}] ${v.name} (default_unit: ${v.default_unit.name})`}</Text>
            );
          }}
        />
        <Table.Column
          dataIndex="unit"
          title="หน่วย"
          sorter
          render={(v: any) => {
            return <Text>{v.name}</Text>;
          }}
        />
        <Table.Column
          dataIndex="order"
          title="ลำดับหน่วย (จากเล็กไปใหญ่)"
          sorter
        />
      </Table>
    </List>
  );
};
