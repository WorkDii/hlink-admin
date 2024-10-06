import { DateField, FilterDropdown, List, useTable, TextField } from "@refinedev/antd";
import { Input, Space, Table, Grid, Form, Checkbox } from "antd";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import dayjs from "dayjs";

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
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
              <Checkbox
                onChange={(e) => {
                    if (e.target.checked) {
                      setCurrent(1);
                    setFilters([
                      {
                       operator: "and",
                       value: [
                        {
                          field: "drugtype",
                          operator: "in",
                          value: ['01', '10'],
                        },
                        {
                          field: "hospital_drug",
                          operator: "null",
                          value: true,
                        }
                       ]
                     }
                    ], "merge");
                  } else {
                    setFilters([], "replace");
                  }
                }}
                style={{ marginRight: 8 }}
              >
                แสดงเฉพาะข้อมูลที่น่าจะมีปัญหา
              </Checkbox>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={3} >
                <div style={{ textAlign: 'right' }}>
                  ทั้งหมด: <b>
                  {tableProps?.pagination && (
                    `${Number(tableProps?.pagination?.total ?? 0).toLocaleString('th-TH')}`
                  )}
                  </b> รายการ
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
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
            dayjs(v).format("DD/MM/YYYY HH:mm:ss")
          )}
        />
      </Table>
    </List>
  );
};
