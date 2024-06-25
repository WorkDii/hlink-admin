import { useList } from "@refinedev/core";
import { Flex, Radio, Typography } from "antd";
import React from "react";

type Props = {
  setPcucode: React.Dispatch<React.SetStateAction<string | undefined>>;
  pcucode: string | undefined;
} & React.HTMLAttributes<HTMLDivElement>;
const { Text } = Typography;
const PcuOptionsButton = ({ setPcucode, pcucode, ...props }: Props) => {
  const { data: allChildrenPcu } = useList({
    resource: "ou",
    filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
    meta: {
      fields: ["id", "name"],
    },
  });

  return (
    <div {...props}>
      <Text>เลือกสถานบริการ</Text>
      <Flex gap="4px 0" wrap>
        <Radio.Group
          onChange={(v) => {
            setPcucode(v.target.value);
          }}
          defaultValue={pcucode}
          size="large"
        >
          <Radio.Button value={undefined}>ทั้งหมด</Radio.Button>
          {allChildrenPcu?.data.map((v) => {
            return <Radio.Button value={v.id}>{v.name}</Radio.Button>;
          })}
        </Radio.Group>
      </Flex>
    </div>
  );
};

export default PcuOptionsButton;
