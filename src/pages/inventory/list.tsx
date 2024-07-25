import { List, useTable } from "@refinedev/antd";
import { Form, Grid, Input, Space, Spin, Table, Typography } from "antd";
import { getDrugCount } from "./controller";
import { useEffect, useState } from "react";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { SearchOutlined } from "@ant-design/icons";
import { debounce, isNumber } from "lodash";
import "./table.css";

const { Text } = Typography;

function showValue(data?: number) {
  return data === undefined ? <Spin></Spin> : data || 0;
}
export const InventoryList = () => {
  const { tableProps, searchFormProps, setFilters, setCurrent } = useTable({
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
  const [dateResetDrugStock, setDateResetDrugStock] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const hospital_drug = tableProps?.dataSource?.map((v) => v.id) as string[];
    if (!pcucode) return;
    getDrugCount(hospital_drug, pcucode).then(
      ({ data, dateResetDrugStock }) => {
        setDrugCount(data);
        setDateResetDrugStock(dateResetDrugStock);
      }
    );
  }, [pcucode, tableProps?.dataSource]);

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
        subTitle: (
          <div>
            ปริมาณการใช้งานยาที่ รพ.สต. ใช้ในการรักษาผู้ป่วย
            <Text type="danger" style={{ marginLeft: "8px" }}>
              โดยคำนวนตั้งแต่วันเริ่มคลังยา ({dateResetDrugStock || "-"})
            </Text>
          </div>
        ),
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
        rowClassName={(r: any) => {
          return drugCount?.[r.id]?.remain < 0 ? "table-row-danger" : "";
        }}
      >
        <Table.Column dataIndex={["hcode", "name"]} title={"รพ."} sorter />
        <Table.Column dataIndex="name" title="ชื่อยา" sorter />
        <Table.Column dataIndex="drugcode24" title="รหัสยา 24 หลัก" sorter />
        <Table.Column
          dataIndex="id"
          title="จำนวนที่ซื้อ"
          render={(v) => {
            return showValue(drugCount?.[v]?.bought);
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="ปริมาณการใช้"
          render={(v) => {
            return showValue(drugCount?.[v]?.used);
          }}
          fixed="right"
        />
        <Table.Column
          dataIndex="id"
          title="จำนวนคงเหลือ"
          render={(v) => {
            const amount = showValue(drugCount?.[v]?.remain);
            return isNumber(amount) && amount < 0 ? (
              <Text type="danger">{amount}</Text>
            ) : (
              amount
            );
          }}
          fixed="right"
        />
      </Table>
    </List>
  );
};
