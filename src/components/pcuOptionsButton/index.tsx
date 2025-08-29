import { useList } from "@refinedev/core";
import { Flex, Radio, Typography } from "antd";
import React, { useEffect } from "react";

type Props = {
  setPcucode: React.Dispatch<React.SetStateAction<string | undefined>>;
  pcucode: string | undefined;
} & React.HTMLAttributes<HTMLDivElement>;
const { Text } = Typography;
const PcuOptionsButton = ({ setPcucode, pcucode, ...props }: Props) => {
  const { data: allChildrenPcu } = useList<{ id: string; name: string }>({
    resource: "ou",
    filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
    meta: {
      fields: ["id", "name"],
    },
  });

  useEffect(() => {
    setPcucode(allChildrenPcu?.data[0].id);
  }, [allChildrenPcu, setPcucode]);

  return (
    <div {...props}>
      <Flex gap="4px 0" wrap>
        <Radio.Group
          onChange={(v) => {
            setPcucode(v.target.value);
          }}
          value={pcucode}
          size="large"
        >
          {allChildrenPcu?.data.map((v) => {
            return <Radio.Button value={v.id}>[{v.id}] {v.name}</Radio.Button>;
          })}
        </Radio.Group>
      </Flex>
    </div>
  );
};

export default PcuOptionsButton;
