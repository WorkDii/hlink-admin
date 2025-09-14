import { useList } from "@refinedev/core";
import { Flex, Select } from "antd";
import React, { useEffect } from "react";

type Props = {
  setPcucode: React.Dispatch<React.SetStateAction<string | undefined>>;
  pcucode: string | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const PcuOptionsButton = ({ setPcucode, pcucode, ...props }: Props) => {
  const { data: allChildrenPcu } = useList<{ id: string; name: string }>({
    resource: "ou",
    filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
    meta: {
      fields: ["id", "name"],
      limit: -1,
    },
  });

  useEffect(() => {
    setPcucode(allChildrenPcu?.data[0].id);
  }, [allChildrenPcu, setPcucode]);

  return (
    <div {...props}>
      <Flex gap="4px 0" wrap>
        <Select
          onChange={(value) => {
            setPcucode(value);
          }}
          value={pcucode}
          size="large"
          placeholder="เลือกหน่วยงาน"
          style={{ minWidth: 300 }}
          showSearch
          filterOption={(input, option) => {
            // Antd exposes option.label (v5+) for Select.Option; fall back to children or value
            const candidate = (option &&
              (option.label ?? option.children ?? option.value)) as
              | string
              | number
              | undefined;
            if (!candidate) return false;
            return String(candidate)
              .toLowerCase()
              .includes(input.toLowerCase());
          }}
        >
          {allChildrenPcu?.data.map((v) => (
            <Select.Option
              key={v.id}
              value={v.id}
              label={`[${v.id}] ${v.name}`}
            >
              [{v.id}] {v.name}
            </Select.Option>
          ))}
        </Select>
      </Flex>
    </div>
  );
};

export default PcuOptionsButton;
