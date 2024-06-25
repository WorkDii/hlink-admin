import { DateField, FilterDropdown, List, useTable } from "@refinedev/antd";
import { Input, Table } from "antd";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { useEffect, useState } from "react";

export const VisitDrugList = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);

  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hospital_drug.*", "pcucode.*"],
    },
    sorters: {
      initial: [{ field: "dateupdate", order: "desc" }],
    },
  });

  useEffect(() => {
    setFilters([{ field: "pcucode", operator: "eq", value: pcucode }]);
  }, [pcucode]);

  return (
    <List
      headerProps={{
        subTitle: `รายการยาที่ รพ.สต. จ่ายให้ผู้ป่วย`,
      }}
    >
      <PcuOptionsButton
        pcucode={pcucode}
        setPcucode={setPcucode}
        style={{ marginBottom: 8 }}
      ></PcuOptionsButton>
      {/* <Checkbox
        style={{ marginBottom: 16 }}
        onChange={(e) => {
          setIsExpectedProblems(e.target.checked);
        }}
        checked={isExpectedProblems}
      >
        เลือกเฉพาะรายการที่คาดว่ามีปัญหา
      </Checkbox> */}
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
