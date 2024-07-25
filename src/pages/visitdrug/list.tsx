import { DateField, FilterDropdown, List, useTable } from "@refinedev/antd";
import { Input, Space, Table, Grid, Form } from "antd";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

const { useBreakpoint } = Grid;

export const VisitDrugList = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const screens = useBreakpoint();

  const { tableProps, setFilters, setCurrent, searchFormProps } = useTable({
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

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrent(1);
    if (e.target.value === "") {
      setFilters([], "replace");
    } else {
      setFilters(
        [
          {
            operator: "or",
            value: [
              {
                field: "hospital_drug.name",
                operator: "containss",
                value: e.target.value,
              },
              {
                field: "hospital_drug.drugcode24",
                operator: "containss",
                value: e.target.value,
              },
              {
                field: "visitno",
                operator: "containss",
                value: e.target.value,
              },
            ],
          },
        ],
        "merge"
      );
    }
  };
  const debouncedOnChange = debounce(onSearch, 500);

  return (
    <List
      headerProps={{
        subTitle: `รายการยาที่ รพ.สต. จ่ายให้ผู้ป่วย`,
      }}
      headerButtons={() => {
        return (
          <Space
            style={{
              marginTop: screens.xs ? "1.6rem" : undefined,
            }}
          >
            <Form {...searchFormProps} layout="inline">
              <Form.Item name="name" noStyle>
                <Input
                  size="large"
                  prefix={<SearchOutlined className="anticon tertiary" />}
                  placeholder="Search by ชื่อยา รหัสยา"
                  onChange={debouncedOnChange}
                />
              </Form.Item>
            </Form>
          </Space>
        );
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
