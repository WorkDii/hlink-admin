import { Button, Input, List, Modal, Spin, Tag, Typography, Space, Switch } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useWatch } from "antd/lib/form/Form";
import { getRecommendDrug } from "../getRecommendDrug";
import { useSimpleList } from "@refinedev/antd";
import { HospitalDrug } from "../../../../type";
import { getLastInventoryDrugDetail, LastInventoryDrugDetail } from "./getInventoryDrugDetail";

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
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const pcucode = useWatch(["pcucode"], form);
  const [lastInventoryDrugDetail, setLastInventoryDrugDetail] = useState<{ [key: string]: LastInventoryDrugDetail }>({});
  const { listProps, setFilters, setCurrent, } = useSimpleList<HospitalDrug>({
    resource: "hospital_drug",
    meta: {
      fields: ["*", 'pcu2hospital_drug_mapping.*'],
      limit: -1
    },
    sorters: {
      initial: [
        { field: "name", order: "asc" }
      ]
    },
    filters: {
      permanent: [
        { field: "warehouse.bill_warehouse", operator: "eq", value: bill_warehouse },
        { field: 'is_active', operator: "eq", value: true }
      ],
    },
  });

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!listProps.dataSource) return [];

    let filtered = listProps.dataSource as HospitalDrug[];

    // Apply linked drugs filter
    if (showLinkedOnly) {
      filtered = filtered.filter(item =>
        item.pcu2hospital_drug_mapping && item.pcu2hospital_drug_mapping.length > 0
      );
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.drugcode24.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [listProps.dataSource, showLinkedOnly, search]);

  useEffect(() => {
    if (pcucode) {
      getLastInventoryDrugDetail(pcucode).then(res => {
        setLastInventoryDrugDetail(res);
      });
    }
  }, [pcucode]);

  function clearSearch() {
    setSearch("")
    setCurrent(1)
    setFilters([], 'replace')
  }

  // Handle linked drugs filter toggle
  const handleLinkedFilterChange = (checked: boolean) => {
    setShowLinkedOnly(checked);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

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
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Input.Search
          placeholder="ค้นหายาที่ต้องการเพิ่ม (ชื่อยาหรือรหัสยา 24 หลัก)"
          value={search}
          onChange={handleSearchChange}
        />
        <Space>
          <Switch
            checked={showLinkedOnly}
            onChange={handleLinkedFilterChange}
            checkedChildren="แสดงเฉพาะยาที่เชื่อมโยงแล้ว"
            unCheckedChildren="แสดงยาทั้งหมด"
          />
        </Space>
      </Space>
      <Spin spinning={isAdding}>
        <List
          dataSource={filteredData}
          pagination={false}
          renderItem={(item: any, index: number) => {
            const { id, name, drugcode24, is_active, warehouse } = item as HospitalDrug;
            return <List.Item actions={[
              <Button
                disabled={hospital_drug_selected.includes(item.id) || !item.is_active}
                onClick={async () => {
                  try {
                    setIsAdding(true)
                    const data = await getRecommendDrug(pcucode, bill_warehouse, item.id);
                    handleOk(data[0]);
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsAdding(false)
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
                title={
                  <Space>
                    <Typography.Text style={{ minWidth: '30px' }}>
                      {index + 1}.
                    </Typography.Text>
                    {name}
                  </Space>
                }
                description={
                  <div>
                    <Typography.Text>[{drugcode24}] </Typography.Text>
                    <Tag style={{ marginLeft: 8 }}>{warehouse}</Tag>
                    {
                      item.is_active ? "" : <Tag style={{ marginLeft: 8 }} color="error">ยกเลิก</Tag>
                    }
                    {
                      item.pcu2hospital_drug_mapping && item.pcu2hospital_drug_mapping.length > 0 && (
                        <Tag style={{ marginLeft: 8 }} color="success">เชื่อมโยงแล้ว</Tag>
                      )
                    }
                  </div>
                }
              />
            </List.Item>
          }}
        />
      </Spin>
    </Modal>
  );
}