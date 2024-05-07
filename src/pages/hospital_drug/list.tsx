import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Typography } from "antd";
import _ from "lodash";

const { Text } = Typography;

export const HospitalDrugList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hospital_drug_unit.unit.*", "hcode.name"],
    },
  });

  return (
    <List>
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
          dataIndex={"hospital_drug_unit"}
          title={"หน่วย"}
          render={(
            value: Array<{
              unit: { name: string; name_eng: string; id: string };
            }>
          ) => {
            return value.map((v, i) => (
              <Tag key={v.unit.id}>
                {v.unit.name} / {v.unit.name_eng}
              </Tag>
            ));
          }}
          sorter
        />
      </Table>
    </List>
  );
};
