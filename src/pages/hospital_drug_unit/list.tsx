import { DeleteButton, List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Space, Table, Typography } from "antd";

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
    sorters: {
      initial: [
        { field: "hcode", order: "asc" },
        { field: "hospital_drug", order: "asc" },
        { field: "multiplier", order: "asc" },
      ],
    },
  });
  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  return (
    <List
      headerProps={{
        subTitle:
          "รายการหน่วยของยาที่ใช้งานในโรงพยาบาลนั้นๆ เช่น xxx มีการใช้งานหน่วยเม็ดแผงและกระปุก เป็นต้น",
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
            return <Text>{`[${v.drugcode24}] ${v.name}`}</Text>;
          }}
        />
        <Table.Column
          dataIndex="hospital_drug"
          title="หน่วยพื้นฐาน"
          render={(v: HospitalDrug) => {
            return <Text>{v.default_unit.name}</Text>;
          }}
        />
        <Table.Column
          dataIndex="unit"
          title="หน่วย"
          sorter
          render={(v: Unit) => {
            return <Text>{v.name}</Text>;
          }}
        />
        <Table.Column
          dataIndex="multiplier"
          title="ตัวคูณ"
          sorter
          fixed="right"
        />
        <Table.Column
          fixed="right"
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
