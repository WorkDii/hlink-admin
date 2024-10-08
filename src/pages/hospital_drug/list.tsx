import { SearchOutlined } from "@ant-design/icons";
import { List, useTable, BooleanField } from "@refinedev/antd";
import { Form, Grid, Input, Space, Table, Typography } from "antd";
import { debounce } from "lodash";

const { Text } = Typography;

const TrueIcon = () => <span>✅</span>;

const FalseIcon = () => <span>❌</span>;

export const HospitalDrugList = () => {
  const { tableProps, searchFormProps, setCurrent, setFilters } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "default_unit.*", "hcode.name"],
    },
  });

  const screens = Grid.useBreakpoint();
  
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrent(1);
    if (e.target.value === "") {
      setFilters([], "replace");
    } else {
      setFilters(
        [
          {
            field: "search",
            operator: "eq",
            value: e.target.value,
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
        subTitle: `รายกการยาของโรงพยาบาลแม่ข่าย`,
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
                  onChange={debouncedOnChange}
                />
              </Form.Item>
            </Form>
          </Space>
        );
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
        <Table.Column
          dataIndex={"hcode"}
          title={"ได้รับยาจาก รพ."}
          sorter
          render={(v) => {
            return <Text>{v.name}</Text>;
          }}
        />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column dataIndex="h_drugcode" title="รหัสยา รพ." sorter />
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
        <Table.Column dataIndex={"warehouse"} title={"คลัง"} sorter />
        <Table.Column
          dataIndex="is_active"
          title="สถานะ"
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
      </Table>
    </List>
  );
};
