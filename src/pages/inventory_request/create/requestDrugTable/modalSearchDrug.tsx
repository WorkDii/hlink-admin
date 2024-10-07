import { Button, Input, List, Modal, Spin, Typography } from "antd";
import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { debounce } from "lodash";
import { useWatch } from "antd/lib/form/Form";
import { getRecommendDrug } from "../getRecommendDrug";

type Props = {
  isModalOpen: boolean;
  handleOk: (data: any) => void;
  handleCancel: () => void;
  form: any;
};

export default function ModalSearchDrug({
  isModalOpen,
  handleOk,
  handleCancel,
  form,
}: Props) {
  const [search, setSearch] = useState("");
  const hospital_drug_selected = useWatch(["hospital_drug_selected"], form);
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading, isFetching } = useList<{
    id: string;
    name: string;
    drugcode24: string;
  }>({
    resource: "hospital_drug",
    meta: {
      fields: ["*"],
    },
    filters: [
      {
        operator: "or",
        value: search
          ? [
              {
                field: "name",
                operator: "containss",
                value: search,
              },
              {
                field: "drugcode24",
                operator: "containss",
                value: search,
              },
            ]
          : [],
      },
    ],
  });

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setSearch("");
    } else {
      setSearch(e.target.value);
    }
  };
  const debouncedOnChange = debounce(onSearch, 500);
  if (!data) return null;

  return (
    <Modal
      title="ค้นหายาที่ต้องการเพิ่ม"
      open={isModalOpen}
      onCancel={handleCancel}
      okText="เพิ่มรายการยา"
      cancelText="ยกเลิก"
      footer={null}
      width={800}
    >
      <Input.Search
        onChange={debouncedOnChange}
        style={{ marginBottom: "16px" }}
        loading={isLoading || isFetching}
      ></Input.Search>

      <Spin size="large" spinning={isLoading || isFetching || isAdding}>
        <List
          bordered
          dataSource={data.data}
          renderItem={(item) => (
            <List.Item>
              <div>
                <Typography.Text>[{item.drugcode24}] </Typography.Text>
                {item.name}
              </div>
              <Button
                disabled={hospital_drug_selected.includes(item.id)}
                onClick={async () => {
                  setIsAdding(true);
                  try {
                    const pcucode = form.getFieldValue("pcucode");
                    const data = await getRecommendDrug(pcucode, item.id);
                    handleOk(data[0]);
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsAdding(false);
                  }
                }}
              >
                เพิ่มรายการ
              </Button>
            </List.Item>
          )}
        />
      </Spin>
    </Modal>
  );
}
