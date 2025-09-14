import { useList } from "@refinedev/core";
import { Flex, Select } from "antd";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  setPcucode: React.Dispatch<React.SetStateAction<string | undefined>>;
  pcucode: string | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const PcuOptionsButton = ({ setPcucode, pcucode, ...props }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allChildrenPcu } = useList<{ id: string; name: string }>({
    resource: "ou",
    filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
    meta: {
      fields: ["id", "name"],
      limit: -1,
    },
  });

  // 1) Initialize from URL when available
  useEffect(() => {
    const urlPcucode = searchParams.get("pcucode") || undefined;
    if (urlPcucode && urlPcucode !== pcucode) {
      setPcucode(urlPcucode);
    }
  }, [searchParams, pcucode, setPcucode]);

  // 2) If nothing in URL and we have data, set default and write to URL
  useEffect(() => {
    if (!pcucode && allChildrenPcu?.data?.length) {
      const urlPcucode = searchParams.get("pcucode");
      if (!urlPcucode) {
        const first = allChildrenPcu.data[0]?.id;
        if (first) {
          setPcucode(first);
          const next = new URLSearchParams(searchParams);
          next.set("pcucode", first);
          setSearchParams(next, { replace: true });
        }
      }
    }
  }, [allChildrenPcu, pcucode, searchParams, setPcucode, setSearchParams]);

  return (
    <div {...props}>
      <Flex gap="4px 0" wrap>
        <Select
          onChange={(value) => {
            setPcucode(value);
            const next = new URLSearchParams(searchParams);
            if (value) {
              next.set("pcucode", value);
            } else {
              next.delete("pcucode");
            }
            setSearchParams(next, { replace: true });
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
