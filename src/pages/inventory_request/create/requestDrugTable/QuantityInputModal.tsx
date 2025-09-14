import { Button, Modal, Typography, Row, Col, Divider, InputNumber } from "antd";
import { useState, useEffect, useMemo, useRef } from "react";
import { accountant } from "../../../../utils/numth";
import { HospitalDrug as _HospitalDrug } from "../../../../type";
import { LastInventoryDrugDetail } from "./getInventoryDrugDetail";
import { Collections } from "../../../../directus/generated/client";
import { HospitalDrug } from "./modalSearchDrug";

// Reusable styles
const STYLES = {
  infoBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
  },
  postWithdrawalBox: {
    backgroundColor: '#f5f5f5',
  },
  currentInfoBox: {
    backgroundColor: '#f0f8ff',
  },
  warningBox: {
    backgroundColor: '#fff7e6',
  },
  smallText: {
    fontSize: '12px',
  },
};

interface CalculationResult {
  postWithdrawalQuantity: number;
  postWithdrawalRatio: number;
  postWithdrawalDays: number;
}

interface CurrentInventoryInfo {
  remaining: number;
  issued30day: number;
  currentRatio: number;
  currentDays: number;
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

/**
 * Calculate post-withdrawal inventory statistics
 * @param currentRemaining - Current remaining quantity
 * @param requestQuantity - Quantity being requested
 * @param issued30day - Amount issued in the last 30 days
 * @returns Calculated post-withdrawal data
 */
const calculatePostWithdrawal = (
  currentRemaining: number,
  requestQuantity: number,
  issued30day: number
): CalculationResult => {
  const postWithdrawalQuantity = currentRemaining + requestQuantity;
  const postWithdrawalRatio = issued30day > 0 ? postWithdrawalQuantity / issued30day : 0;
  const postWithdrawalDays = Math.round(postWithdrawalRatio * 30);

  return {
    postWithdrawalQuantity,
    postWithdrawalRatio,
    postWithdrawalDays,
  };
};

/**
 * Extract current inventory information from last inventory detail
 * @param lastInventoryDetail - Last inventory detail data
 * @returns Current inventory information or default values
 */
const getCurrentInventoryInfo = (lastInventoryDetail?: LastInventoryDrugDetail): CurrentInventoryInfo => {
  if (!lastInventoryDetail) {
    return {
      remaining: 0,
      issued30day: 0,
      currentRatio: 0,
      currentDays: 0,
    };
  }

  return {
    remaining: lastInventoryDetail.remaining,
    issued30day: lastInventoryDetail.issued30day,
    currentRatio: lastInventoryDetail.ratio.value,
    currentDays: lastInventoryDetail.ratio.days,
  };
};

/**
 * Format quantity using accountant function
 */
const formatQuantity = (quantity: number): string => {
  return accountant(quantity);
};

/**
 * Format ratio display with days
 */
const formatRatioDisplay = (ratio: number, days: number): string => {
  return `${ratio.toFixed(2)} เท่า (${accountant(days)} วัน)`;
};

/**
 * Default ratio display for empty states
 */
const DEFAULT_RATIO_DISPLAY = '0.00 เท่า (0 วัน)';

export default function QuantityInputModal({
  isOpen,
  onCancel,
  onConfirm,
  selectedDrug,
  isAdding,
}: Props) {
  const [requestQuantity, setRequestQuantity] = useState<number>(0);
  const inputRef = useRef<any>(null);

  // Initialize quantity when modal opens or drug changes
  useEffect(() => {
    if (isOpen && selectedDrug) {
      const initialQuantity = selectedDrug.lastInventoryDetail
        ? selectedDrug.recommendQuantity // Use recommended quantity for linked drugs
        : 0; // Start with 0 for unlinked drugs

      setRequestQuantity(initialQuantity);

      // Auto-focus the input field when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setRequestQuantity(0);
    }
  }, [isOpen, selectedDrug]);

  // Memoized calculations to avoid unnecessary re-computations
  const currentInventoryInfo = useMemo(() =>
    getCurrentInventoryInfo(selectedDrug?.lastInventoryDetail),
    [selectedDrug?.lastInventoryDetail]
  );

  const postWithdrawalData = useMemo(() => {
    if (!selectedDrug) return null;

    return calculatePostWithdrawal(
      currentInventoryInfo.remaining,
      requestQuantity,
      currentInventoryInfo.issued30day
    );
  }, [selectedDrug, currentInventoryInfo.remaining, currentInventoryInfo.issued30day, requestQuantity]);

  const handleConfirm = () => {
    if (requestQuantity > 0) {
      onConfirm(requestQuantity);
    }
  };

  const handleCancel = () => {
    setRequestQuantity(0);
    onCancel();
  };

  /**
   * Handle keyboard shortcuts for better ergonomics
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (requestQuantity > 0 && !isAdding) {
        handleConfirm();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  /**
   * Handle global keyboard events for modal
   */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen]);

  /**
   * Handle quantity input change and convert to actual quantity using prepack
   */
  const handleQuantityChange = (value: number | null) => {
    if (selectedDrug) {
      const actualQuantity = (value || 0) * selectedDrug.item.prepack;
      setRequestQuantity(actualQuantity);
    }
  };

  /**
   * Get validation status for the input
   */
  const getInputStatus = (): 'error' | 'warning' | undefined => {
    if (requestQuantity < 0) return 'error';
    if (requestQuantity === 0) return 'warning';
    return undefined;
  };

  /**
   * Get validation message
   */
  const getValidationMessage = (): string => {
    if (requestQuantity < 0) return 'จำนวนต้องมากกว่าหรือเท่ากับ 0';
    if (requestQuantity === 0) return 'กรุณาระบุจำนวนที่ต้องการเบิก';
    return '';
  };

  /**
   * Convert actual quantity back to display quantity (divided by prepack)
   */
  const displayQuantity = useMemo(() => {
    return selectedDrug ? requestQuantity / selectedDrug.item.prepack : 0;
  }, [selectedDrug, requestQuantity]);

  return (
    <Modal
      title="กำหนดจำนวนที่ต้องการเบิก"
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          tabIndex={3}
          aria-label="ยกเลิกการกำหนดจำนวน"
        >
          ยกเลิก (Esc)
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={requestQuantity <= 0}
          loading={isAdding}
          tabIndex={2}
          aria-label="ยืนยันการกำหนดจำนวน"
        >
          ยืนยัน (Enter)
        </Button>
      ]}
      width={600}
      destroyOnClose
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
                ref={inputRef}
                style={{ width: '100%', marginTop: 8 }}
                value={displayQuantity}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                min={0}
                placeholder="กรุณาระบุจำนวน"
                addonAfter={`x${selectedDrug.item.prepack}`}
                autoComplete="off"
                tabIndex={1}
                status={getInputStatus()}
                aria-label="จำนวนที่ต้องการเบิก"
                aria-describedby="quantity-help"
                aria-invalid={getInputStatus() === 'error'}
              />
              <Typography.Text
                id="quantity-help"
                type={getInputStatus() === 'error' ? 'danger' : getInputStatus() === 'warning' ? 'warning' : 'secondary'}
                style={{ fontSize: '12px', display: 'block', marginTop: 4 }}
              >
                {getValidationMessage() || 'กด Enter เพื่อยืนยัน หรือ Esc เพื่อยกเลิก'}
              </Typography.Text>
            </Col>

            <Col span={12}>
              <Typography.Text strong>จำนวนหลังเบิก:</Typography.Text>
              <div style={{ ...STYLES.infoBox, ...STYLES.postWithdrawalBox }}>
                <Typography.Text>
                  {postWithdrawalData ? formatQuantity(postWithdrawalData.postWithdrawalQuantity) : '0'}
                </Typography.Text>
              </div>
            </Col>

            <Col span={12}>
              <Typography.Text strong>อัตราหลังเบิก:</Typography.Text>
              <div style={{ ...STYLES.infoBox, ...STYLES.postWithdrawalBox }}>
                <Typography.Text>
                  {postWithdrawalData
                    ? formatRatioDisplay(postWithdrawalData.postWithdrawalRatio, postWithdrawalData.postWithdrawalDays)
                    : DEFAULT_RATIO_DISPLAY
                  }
                </Typography.Text>
              </div>
            </Col>

            {selectedDrug.lastInventoryDetail && (
              <Col span={12}>
                <Typography.Text strong>ข้อมูลปัจจุบัน:</Typography.Text>
                <div style={{ ...STYLES.infoBox, ...STYLES.currentInfoBox }}>
                  <Typography.Text style={STYLES.smallText}>
                    คงเหลือ: {formatQuantity(currentInventoryInfo.remaining)} {selectedDrug.item.default_unit.name || 'หน่วย'}<br />
                    การใช้งาน 30 วัน: {formatQuantity(currentInventoryInfo.issued30day)} {selectedDrug.item.default_unit.name || 'หน่วย'}<br />
                    อัตราปัจจุบัน: {formatRatioDisplay(currentInventoryInfo.currentRatio, currentInventoryInfo.currentDays)}
                  </Typography.Text>
                </div>
              </Col>
            )}

            {!selectedDrug.lastInventoryDetail && (
              <Col span={12}>
                <Typography.Text strong>สถานะ:</Typography.Text>
                <div style={{ ...STYLES.infoBox, ...STYLES.warningBox }}>
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
