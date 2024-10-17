import { Button, Input, List, Modal, Spin, Tag, Typography } from "antd";
import { useState } from "react";
import { useWatch } from "antd/lib/form/Form";
import { getRecommendDrug } from "../getRecommendDrug";
import { useSimpleList } from "@refinedev/antd";
import { HospitalDrug } from "../../../../type";

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
  const hospital_drug_selected = useWatch(["hospital_drug_selected"], form);
  const [isAdding, setIsAdding] = useState(false);
  const bill_warehouse = useWatch(["bill_warehouse"], form);
  const [search, setSearch] = useState("")
  const { listProps, setFilters, setCurrent } = useSimpleList<HospitalDrug>({  
    resource: "hospital_drug",
    meta: {
      fields: ["*"],
    },
    filters: {
      permanent: [
        {field: "warehouse.bill_warehouse", operator: "eq", value: bill_warehouse}
      ]
    },
  });


  function clearSearch() {
    setSearch("")
    setCurrent(1)
    setFilters([], 'replace')
  }

  return (
    <Modal
      title="ค้นหายาที่ต้องการเพิ่ม"
      open={isModalOpen}
      onCancel={() => {
        handleCancel()
        clearSearch()
      }}
      okText="เพิ่มรายการยา"
      cancelText="ยกเลิก"
      footer={null}
      width={800}
    >
      <Input.Search
        placeholder="ค้นหายาที่ต้องการเพิ่ม (ชื่อยาหรือรหัสยา 24 หลัก)"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setCurrent(1)
          if (!e.target.value) {
            return setFilters([], "replace")
          }
          setFilters([
            {
              operator: "or",
              value: [
                {
                  field: "name",
                  operator: "containss",
                  value: e.target.value,
                },
                {
                  field: "drugcode24",
                  operator: "containss",
                  value: e.target.value,
                }
              ]
            }
          ]);
        }}
      />
      <Spin spinning={isAdding}>
        <List {...listProps} renderItem={(item: HospitalDrug) => {
          const { id, name, drugcode24, is_active, warehouse } = item;
          return <List.Item actions={[
            <Button
            disabled={hospital_drug_selected.includes(item.id) || !item.is_active}
              onClick={async () => {
                try {
                setIsAdding(true)
                const pcucode = form.getFieldValue("pcucode");
                const data = await getRecommendDrug(pcucode, bill_warehouse, item.id);
                handleOk(data[0]);
              } catch (error) {
                console.error(error);
              } finally {
                setIsAdding(false);
                clearSearch()
              }
            }}
          >
            เพิ่มรายการ 
          </Button>
          ]}>
            <List.Item.Meta 
              style={{
                opacity: item.is_active ? 1 : 0.5
              }}
              title={name} 
              description={
                <div>
                  <Typography.Text>[{drugcode24}] </Typography.Text>
                  <Tag style={{ marginLeft: 8 }}>{warehouse}</Tag>
                  {
                    item.is_active ? "" : <Tag style={{ marginLeft: 8 }} color="error">ยกเลิก</Tag>
                  }
                </div>
              } 
            />
          </List.Item>
        }} pagination={{ ...listProps.pagination, align: "end", }} ></List>
      </Spin>
    </Modal>
  );
}