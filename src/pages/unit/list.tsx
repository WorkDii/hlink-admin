import { SearchOutlined } from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { Badge, Form, Grid, Input, Space, Table, Typography } from "antd";
import debounce from "lodash/debounce";

const { Text } = Typography;

export const UnitList = () => {
  const { tableProps, searchFormProps, setFilters, setCurrent } = useTable({
    syncWithLocation: true,
    onSearch: (values: any) => {
      return [
        {
          operator: "or",
          value: [
            {
              field: "name",
              operator: "contains",
              value: values.name,
            },
          ],
        },
      ];
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
        subTitle: `หน่วยของยาที่ใช้ในโรงพยาบาลและสถานบริการสุขภาพ`,
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
                  placeholder="Search by name"
                  onChange={debouncedOnChange}
                />
              </Form.Item>
            </Form>
          </Space>
        );
      }}
    >
      <Text type="warning">
        กรุณาแจ้ง admin เพื่อเพิ่มหน่วย, user ไม่สามารถเพิ่มหน่วยได้ด้วยตนเอง
      </Text>
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
        }}
      >
        <Table.Column dataIndex="id" title={"รหัส"} sorter />
        <Table.Column dataIndex="name" title={"ชื่อ"} sorter />
        <Table.Column
          dataIndex="is_active"
          title={"สถานะการใช้งาน"}
          sorter
          render={(v: boolean) => {
            return v ? (
              <Badge color="green" text="ใช้งาน"></Badge>
            ) : (
              <Badge color="red" text="ไม่ใช้งาน"></Badge>
            );
          }}
        />
      </Table>
    </List>
  );
};
