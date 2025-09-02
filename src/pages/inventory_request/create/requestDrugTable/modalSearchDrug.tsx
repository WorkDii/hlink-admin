import { Button, Input, List, Modal, Spin, Tag, Typography, Space, Switch } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useWatch } from "antd/lib/form/Form";
import { useSimpleList } from "@refinedev/antd";
import { HospitalDrug as _HospitalDrug } from "../../../../type";
import { getLastInventoryDrugDetail, LastInventoryDrugDetail } from "./getInventoryDrugDetail";
import { Collections } from "../../../../directus/generated/client";
import { getRecommendDrug } from "../getRecommendDrug1";
import { getRecommendRequestQuantity } from "../getRecommendRequestQuantity1";
import QuantityInputModal from "./QuantityInputModal";
import { accountant } from '@wdii/numth'

type Props = {
  isModalOpen: boolean;
  handleOk: (data: any) => void;
  handleCancel: () => void;
  form: any;
};

export interface HospitalDrug extends Omit<_HospitalDrug, 'pcu2hospital_drug_mapping' | 'default_unit'> {
  pcu2hospital_drug_mapping: Collections.Pcu2hospitalDrugMapping[];
  default_unit: Collections.Unit;
}

// Component for displaying drug inventory details
const DrugInventoryDetails = ({
  lastInventoryDetail,
  recommendQuantity,
  unitsellname,
}: {
  lastInventoryDetail: LastInventoryDrugDetail;
  recommendQuantity: number;
  unitsellname: string;
}) => {
  const { issued30day, remaining, ratio, } = lastInventoryDetail;
  return (
    <div style={{ marginTop: 8 }}>
      <Space size="small" wrap>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          การใช้งาน 30 วัน: {accountant(issued30day)}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          คงเหลือ: {accountant(remaining)}
        </Typography.Text>
        <Tag color={ratio.color} style={{ fontSize: '11px' }}>
          อัตรา: {ratio.value} เท่า ({accountant(ratio.days)} วัน)
        </Tag>
        <Tag color={ratio.color} style={{ fontSize: '11px' }}>
          {ratio.status}
        </Tag>
        <Tag color="blue" style={{ fontSize: '11px' }}>
          แนะนำ: {accountant(recommendQuantity)} {unitsellname || 'หน่วย'}
        </Tag>
      </Space>
    </div>
  );
};

// Component for displaying drug tags
const DrugTags = ({ item }: { item: HospitalDrug }) => {
  const tags = [];

  if (!item.is_active) {
    tags.push(<Tag key="inactive" color="error">ยกเลิก</Tag>);
  }
  return tags.length > 0 ? (
    <Space size="small">
      {tags}
    </Space>
  ) : null;
};

export default function ModalSearchDrug({
  isModalOpen,
  handleOk,
  handleCancel,
  form,
}: Props) {
  // Form watchers
  const hospital_drug_selected = useWatch(["hospital_drug_selected"], form);
  const bill_warehouse = useWatch(["bill_warehouse"], form);
  const pcucode = useWatch(["pcucode"], form);

  // Local state
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [showRecommendQuantityOnly, setShowRecommendQuantityOnly] = useState(false);
  const [lastInventoryDrugDetail, setLastInventoryDrugDetail] = useState<{
    [key: string]: LastInventoryDrugDetail
  }>({});
  const [selectedDrug, setSelectedDrug] = useState<{
    item: HospitalDrug;
    lastInventoryDetail?: LastInventoryDrugDetail;
    recommendQuantity: number;
  } | null>(null);

  // API data fetching
  const { listProps, setFilters, setCurrent } = useSimpleList<HospitalDrug>({
    resource: "hospital_drug",
    meta: {
      fields: ["*", 'pcu2hospital_drug_mapping.*', 'default_unit.*'],
      limit: -1
    },
    sorters: {
      initial: [{ field: "name", order: "asc" }]
    },
    filters: {
      permanent: [
        { field: "warehouse.bill_warehouse", operator: "eq", value: bill_warehouse },
        { field: 'is_active', operator: "eq", value: true }
      ],
    },
  });

  // Client-side filtering with recommendQuantity calculation
  const filteredData = useMemo(() => {
    if (!listProps.dataSource) return [];

    let filtered = listProps.dataSource.map(item => {
      const lastInventoryDetail = item.pcu2hospital_drug_mapping.length > 0
        ? lastInventoryDrugDetail[item.pcu2hospital_drug_mapping?.[0].drugcode || '']
        : undefined;

      const recommendQuantity = getRecommendRequestQuantity({
        current_rate: Number(lastInventoryDetail?.issued30day),
        current_remain: Number(lastInventoryDetail?.remaining),
        prepack: item.prepack,
      });

      return {
        ...item,
        lastInventoryDetail,
        recommendQuantity
      };
    });

    // Apply linked drugs filter
    if (showLinkedOnly) {
      filtered = filtered.filter(item =>
        item.pcu2hospital_drug_mapping?.length > 0
      );
    }

    // Apply recommendQuantity > 0 filter
    if (showRecommendQuantityOnly) {
      filtered = filtered.filter(item => item.recommendQuantity > 0);
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
  }, [listProps.dataSource, showLinkedOnly, showRecommendQuantityOnly, search, lastInventoryDrugDetail]);

  // Fetch last inventory details when pcucode changes
  useEffect(() => {
    if (pcucode) {
      getLastInventoryDrugDetail(pcucode).then(setLastInventoryDrugDetail);
    }
  }, [pcucode]);

  // Event handlers
  const clearSearch = () => {
    setSearch("");
    setCurrent(1);
    setFilters([], 'replace');
  };

  const handleLinkedFilterChange = (checked: boolean) => {
    setShowLinkedOnly(checked);
  };

  const handleRecommendQuantityFilterChange = (checked: boolean) => {
    setShowRecommendQuantityOnly(checked);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAddDrug = (item: HospitalDrug, recommendQuantity: number, lastInventoryDetail?: LastInventoryDrugDetail) => {
    setSelectedDrug({
      item,
      lastInventoryDetail,
      recommendQuantity
    });
  };

  const handleConfirmAdd = async (quantity: number) => {
    if (!selectedDrug || quantity <= 0) return;

    try {
      setIsAdding(true);
      const data = await getRecommendDrug(selectedDrug.item, selectedDrug.lastInventoryDetail);

      // Override quantity with user input
      const finalData = {
        ...data,
        quantity: quantity
      };

      handleOk(finalData);
      setSelectedDrug(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
      clearSearch();
    }
  };

  const handleCancelAdd = () => {
    setSelectedDrug(null);
  };

  const handleModalCancel = () => {
    handleCancel();
    clearSearch();
    setSelectedDrug(null);
  };

  // Render drug item
  const renderDrugItem = (item: typeof filteredData[number], index: number) => {
    const { id, name, drugcode24, is_active, warehouse, lastInventoryDetail, recommendQuantity, prepack } = item;
    const isSelected = hospital_drug_selected.includes(id);

    return (
      <List.Item
        actions={[
          <Button
            key="add"
            disabled={isSelected || !is_active}
            onClick={() => handleAddDrug(item, recommendQuantity, lastInventoryDetail)}
          >
            เพิ่มรายการ
          </Button>
        ]}
      >
        <List.Item.Meta
          style={{ opacity: is_active ? 1 : 0.5 }}
          title={
            <Space>
              <Typography.Text style={{ minWidth: '30px' }}>
                {index + 1}.
              </Typography.Text>
              {name}
              {item.lastInventoryDetail && (
                <Tag color="success" style={{ fontSize: '11px' }}>
                  เชื่อมโยงแล้ว
                </Tag>
              )}
            </Space>
          }
          description={
            <div>
              <Typography.Text>[{drugcode24}] [prepack = {accountant(prepack)}]</Typography.Text>
              <Tag style={{ marginLeft: 8 }}>{warehouse}</Tag>
              <DrugTags item={item} />

              {/* Show inventory details for linked drugs */}
              {lastInventoryDetail && (
                <DrugInventoryDetails
                  lastInventoryDetail={lastInventoryDetail}
                  recommendQuantity={recommendQuantity}
                  unitsellname={item.default_unit.name}
                />
              )}
            </div>
          }
        />
      </List.Item>
    );
  };



  return (
    <>
      {/* Quantity Input Modal */}
      <QuantityInputModal
        isOpen={!!selectedDrug}
        onCancel={handleCancelAdd}
        onConfirm={handleConfirmAdd}
        selectedDrug={selectedDrug}
        isAdding={isAdding}
      />

      {/* Main Search Modal */}
      <Modal
        title="ค้นหายาที่ต้องการเพิ่ม"
        open={isModalOpen}
        onCancel={handleModalCancel}
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
          <Space >
            <Switch
              checked={showRecommendQuantityOnly}
              onChange={handleRecommendQuantityFilterChange}
              checkedChildren="แสดงเฉพาะยาที่แนะนำให้ขอ (จำนวน > 0)"
              unCheckedChildren="แสดงยาทั้งหมด"
            />
          </Space>
        </Space>

        <Spin spinning={isAdding}>
          <List
            dataSource={filteredData}
            pagination={false}
            renderItem={renderDrugItem}
          />
        </Spin>
      </Modal>
    </>
  );
}