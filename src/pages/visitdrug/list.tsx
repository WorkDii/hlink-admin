import { DateField, FilterDropdown, List, useTable } from "@refinedev/antd";
import { useResource, useUserFriendlyName } from "@refinedev/core";
import { Input, Table, Typography } from "antd";

const { Text } = Typography;

export const VisitDrugList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hospital_drug.*", "pcucode.*"],
    },
    sorters: {
      initial: [{ field: "dateupdate", order: "desc" }],
    },
  });

  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  return (
    <List
      headerProps={{
        title: `${getUserFriendlyName(resource?.name, "plural")}`,
        subTitle: `รายการยาที่ รพ.สต. จ่ายให้ผู้ป่วย`,
      }}
    >
      <Text type="warning">
        ข้อมูลนี้เกิดจากการดึงข้อมูลมาจาก รพ.สต. โดยอัตโนมัติ
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
          dataIndex={"pcucode"}
          title={"รพ.สต."}
          render={(value) => {
            return `[${value.id}] ${value.name}`;
          }}
          sorter
        />
        <Table.Column dataIndex="visitno" title="visitcode" sorter />
        <Table.Column dataIndex="drugcode" title={"รหัสยาของ รพ.สต."} sorter />
        <Table.Column
          dataIndex={["hospital_drug", "drugcode24"]}
          title={"รหัสยา 24 หลักของโรงพยาบาล"}
          sorter
        />
        <Table.Column
          dataIndex={["hospital_drug", "name"]}
          title={"ชื่อยาของโรงพยาบาล"}
          sorter
        />
        <Table.Column
          dataIndex="drugtype"
          title="ประเภทยา"
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Search Name" />
            </FilterDropdown>
          )}
        />
        <Table.Column dataIndex="unit" title="ปริมาณการจ่ายยา" sorter />
        <Table.Column
          dataIndex="dateupdate"
          title="วันที่"
          sorter
          render={(v) => (
            <DateField value={v} format="LLL" locales="th"></DateField>
          )}
        />
      </Table>
    </List>
  );
};
