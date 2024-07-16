import { List, useTable } from "@refinedev/antd";
import { Form, Grid, Input, Space, Table, Typography } from "antd";
import { getDrugCount } from "./controller";
import { useEffect, useState } from "react";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

const { Text } = Typography;

export const InventoryList = () => {
  const { tableProps, searchFormProps, setFilters } = useTable({
    syncWithLocation: true,
    meta: {
      fields: ["*", "hcode.*"],
    },
    resource: "hospital_drug",
  });
  const [drugCount, setDrugCount] = useState<{
    [key: string]: {
      bought: number;
      used: number;
      remain: number;
    };
  }>({});

  const [pcucode, setPcucode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!tableProps?.dataSource?.length) return;
    const hospital_drug = tableProps?.dataSource?.map((v) => v.id) as string[];
    getDrugCount(hospital_drug, pcucode).then((data) => {
      setDrugCount(data);
    });
  }, [tableProps?.dataSource, pcucode]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        "replace"
      );
    }
  };
  const debouncedOnChange = debounce(onSearch, 500);
  const screens = Grid.useBreakpoint();

  return (
    <List
      headerProps={{
        subTitle: `ปริมาณการใช้งานยาที่ รพ.สต. ใช้ในการรักษาผู้ป่วย`,
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
        style={{ marginBottom: 16 }}
      ></PcuOptionsButton>
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
        }}
      >
        <Table.Column dataIndex={["hcode", "name"]} title={"รพ."} sorter />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column
          dataIndex="id"
          title="จำนวนที่ซื้อ"
          render={(v) => {
            return drugCount?.[v]?.bought | 0;
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="ปริมาณการใช้"
          render={(v) => {
            return drugCount?.[v]?.used | 0;
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="จำนวนคงเหลือ"
          render={(v) => {
            const amount = drugCount?.[v]?.remain;
            if (amount < 0) {
              return <Text type="danger">{amount}</Text>;
            }
            return amount;
          }}
          fixed="right"
        />
      </Table>
    </List>
  );
};
