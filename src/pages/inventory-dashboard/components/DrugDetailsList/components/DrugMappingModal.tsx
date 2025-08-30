import React from 'react';
import { Modal, Input } from 'antd';
import { DRUG_TYPE_MAP } from '../constants';
import { formatNumber } from '../utils';

interface DrugMappingModalProps {
  visible: boolean;
  selectedRecord: any | null;
  selectedHospitalDrugId: string;
  isMapping: boolean;
  onOk: () => void;
  onCancel: () => void;
  onHospitalDrugIdChange: (value: string) => void;
}

export const DrugMappingModal: React.FC<DrugMappingModalProps> = ({
  visible,
  selectedRecord,
  selectedHospitalDrugId,
  isMapping,
  onOk,
  onCancel,
  onHospitalDrugIdChange,
}) => {
  return (
    <Modal
      title="เชื่อมโยงยา"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="เชื่อมโยง"
      cancelText="ยกเลิก"
      confirmLoading={isMapping}
      width={600}
    >
      {selectedRecord && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>ข้อมูลยาที่ต้องการเชื่อมโยง:</h4>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
              <p><strong>รหัสยา:</strong> {selectedRecord.drugcode}</p>
              <p><strong>ประเภทยา:</strong> {DRUG_TYPE_MAP[selectedRecord.drugtype] || selectedRecord.drugtype}</p>
              <p><strong>คงเหลือ:</strong> {formatNumber(selectedRecord.remaining)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>เลือกยาที่ต้องการเชื่อมโยง:</h4>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
              เลือกยาจากรายการยาของโรงพยาบาลที่ตรงกับยานี้
            </p>
            <Input
              placeholder="ค้นหายาในโรงพยาบาล..."
              size="large"
              style={{ marginBottom: '12px' }}
              value={selectedHospitalDrugId}
              onChange={(e) => onHospitalDrugIdChange(e.target.value)}
            />
            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#fafafa'
            }}>
              <p style={{ color: '#999', textAlign: 'center' }}>
                ระบบจะแสดงรายการยาจากโรงพยาบาลที่นี่
              </p>
              <p style={{ color: '#999', textAlign: 'center', fontSize: '12px' }}>
                (ต้องเชื่อมต่อกับ API รายการยาของโรงพยาบาล)
              </p>
            </div>
          </div>

          <div style={{
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '12px'
          }}>
            <p style={{ margin: 0, color: '#1890ff' }}>
              <strong>หมายเหตุ:</strong> การเชื่อมโยงนี้จะสร้างความสัมพันธ์ระหว่างรหัสยาในระบบ (pcucode)
              กับข้อมูลยาในโรงพยาบาล (hospital_drug) เพื่อให้สามารถแสดงข้อมูลราคาและรายละเอียดอื่นๆ ได้
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
