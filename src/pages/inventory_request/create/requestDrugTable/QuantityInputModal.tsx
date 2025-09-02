import { Button, Modal, Typography, Row, Col, Divider, InputNumber } from "antd";
import { useState, useEffect } from "react";
import { accountant } from "@wdii/numth";
import { HospitalDrug as _HospitalDrug } from "../../../../type";
import { LastInventoryDrugDetail } from "./getInventoryDrugDetail";
import { Collections } from "../../../../directus/generated/client";

interface HospitalDrug extends Omit<_HospitalDrug, 'pcu2hospital_drug_mapping'> {
  pcu2hospital_drug_mapping: Collections.Pcu2hospitalDrugMapping[];
}

type Props = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (quantity: number) => void;
  selectedDrug: {
    item: HospitalDrug;
    lastInventoryDetail?: LastInventoryDrugDetail;
    recommendQuantity: number;
  } | null;
  isAdding: boolean;
};

export default function QuantityInputModal({
  isOpen,
  onCancel,
  onConfirm,
  selectedDrug,
  isAdding,
}: Props) {
  const [requestQuantity, setRequestQuantity] = useState<number>(0);

  // Reset quantity when modal opens/closes or drug changes
  useEffect(() => {
    if (isOpen && selectedDrug) {
      // Set initial quantity based on whether drug is linked or not
      if (selectedDrug.lastInventoryDetail) {
        // For linked drugs, use recommended quantity
        setRequestQuantity(selectedDrug.recommendQuantity);
      } else {
        // For unlinked drugs, start with 0 and let user input
        setRequestQuantity(0);
      }
    } else {
      setRequestQuantity(0);
    }
  }, [isOpen, selectedDrug]);

  const handleConfirm = () => {
    if (requestQuantity > 0) {
      onConfirm(requestQuantity);
    }
  };

  const handleCancel = () => {
    setRequestQuantity(0);
    onCancel();
  };

  // Calculate post-withdrawal values
  const calculatePostWithdrawal = () => {
    if (!selectedDrug) return null;

    const { item, lastInventoryDetail } = selectedDrug;
    const currentRemain = lastInventoryDetail?.remaining || 0;
    const currentRate = lastInventoryDetail?.issued30day || 0;

    // Calculate post-withdrawal quantity
    const postWithdrawalQuantity = currentRemain + requestQuantity;

    // Calculate post-withdrawal ratio (days of stock)
    const postWithdrawalRatio = currentRate > 0 ? postWithdrawalQuantity / currentRate : 0;

    return {
      postWithdrawalQuantity,
      postWithdrawalRatio,
    };
  };

  const postWithdrawalData = calculatePostWithdrawal();

  return (
    <Modal
      title="กำหนดจำนวนที่ต้องการเบิก"
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          ยกเลิก
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={requestQuantity <= 0}
          loading={isAdding}
        >
          ยืนยัน
        </Button>
      ]}
      width={600}
    >
      {selectedDrug && (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Typography.Title level={5}>
                {selectedDrug.item.name}
              </Typography.Title>
              <Typography.Text type="secondary">
                [{selectedDrug.item.drugcode24}] - {selectedDrug.item.warehouse}
              </Typography.Text>
            </Col>

            <Col span={24}>
              <Divider />
            </Col>

            <Col span={12}>
              <Typography.Text strong>จำนวนที่ต้องการเบิก:</Typography.Text>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                value={requestQuantity / selectedDrug.item.prepack}
                onChange={(value) => setRequestQuantity((value || 0) * selectedDrug.item.prepack)}
                min={0}
                placeholder="กรุณาระบุจำนวน"
                addonAfter={`x${selectedDrug.item.prepack}`}
              />
            </Col>

            <Col span={12}>
              <Typography.Text strong>จำนวนหลังเบิก:</Typography.Text>
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Typography.Text>
                  {accountant((Number(selectedDrug.lastInventoryDetail?.remaining)) + requestQuantity)}
                </Typography.Text>
              </div>
            </Col>

            <Col span={12}>
              <Typography.Text strong>อัตราหลังเบิก:</Typography.Text>
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Typography.Text>
                  {((Number(selectedDrug.lastInventoryDetail?.remaining)) + requestQuantity) / Number(selectedDrug.lastInventoryDetail?.issued30day)} เท่า ({Math.round(postWithdrawalData?.postWithdrawalRatio || 0)} วัน)
                </Typography.Text>
              </div>
            </Col>

            {selectedDrug.lastInventoryDetail && (
              <Col span={12}>
                <Typography.Text strong>ข้อมูลปัจจุบัน:</Typography.Text>
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f8ff', borderRadius: 4 }}>
                  <Typography.Text style={{ fontSize: '12px' }}>
                    คงเหลือ: {selectedDrug.lastInventoryDetail.remaining.toLocaleString()} {selectedDrug.item.default_unit || 'หน่วย'}<br />
                    การใช้งาน 30 วัน: {selectedDrug.lastInventoryDetail.issued30day.toLocaleString()} {selectedDrug.item.default_unit || 'หน่วย'}<br />
                    อัตราปัจจุบัน: {selectedDrug.lastInventoryDetail.ratio.value} เท่า ({selectedDrug.lastInventoryDetail.ratio.days} วัน)
                  </Typography.Text>
                </div>
              </Col>
            )}

            {!selectedDrug.lastInventoryDetail && (
              <Col span={12}>
                <Typography.Text strong>สถานะ:</Typography.Text>
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
                  <Typography.Text type="warning">
                    ยานี้ยังไม่เชื่อมโยงกับระบบ PCU
                  </Typography.Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Modal>
  );
}
