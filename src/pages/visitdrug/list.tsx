import { DateField, List, useTable } from "@refinedev/antd";
import { useMany, useResource, useUserFriendlyName } from "@refinedev/core";
import { Table, Typography } from "antd";
import _ from "lodash";

const { Text } = Typography;

export const VisitDrugList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { data: ouData, isLoading: ouIsLoading } = useMany({
    resource: "ou",
    ids: _.uniq(tableProps?.dataSource?.map((item) => item?.pcucode)),

    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const { resource } = useResource();
  const getUserFriendlyName = useUserFriendlyName();
  return (
    <List
      title={`${getUserFriendlyName(
        resource?.name,
        "plural"
      )} (รายกการยาที่ รพ.สต. จ่ายให้ผู้ป่วย)`}
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
            if (ouIsLoading) return <>Loading...</>;
            const item = ouData?.data?.find((item) => item.id === value);
            return `[${item?.id}] ${item?.name}`;
          }}
          sorter
        />
        <Table.Column dataIndex="visitno" title="visitcode" sorter />
        <Table.Column dataIndex="drugcode" title={"รหัสยาของ รพ.สต."} sorter />
        <Table.Column dataIndex="unit" title="ปริมาณการจ่ายยา" sorter />
        <Table.Column
          dataIndex="dateupdate"
          title="วันที่"
          sorter
          render={(v) => (
            <DateField value={v} format="LLL" locales="th"></DateField>
          )}
        />
        <Table.Column
          dataIndex="hospital_code"
          title={"รหัสยา 24 หลักของโรงพยาบาล"}
          sorter
        />
      </Table>
    </List>
  );
};
