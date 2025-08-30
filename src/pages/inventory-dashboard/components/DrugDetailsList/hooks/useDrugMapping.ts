import { useState, useCallback } from 'react';
import { message } from 'antd';
import { MappingModalState } from '../types';

export const useDrugMapping = () => {
  const [mappingModal, setMappingModal] = useState<MappingModalState>({
    visible: false,
    selectedRecord: null,
    selectedHospitalDrugId: '',
    isMapping: false
  });

  const handleOpenMappingModal = useCallback((record: any) => {
    setMappingModal({
      visible: true,
      selectedRecord: record,
      selectedHospitalDrugId: '',
      isMapping: false
    });
  }, []);

  const handleCreateMapping = useCallback(async () => {
    if (!mappingModal.selectedHospitalDrugId) {
      message.error('กรุณาเลือกยาที่ต้องการเชื่อมโยง');
      return;
    }

    try {
      setMappingModal(prev => ({ ...prev, isMapping: true }));

      // Here you would typically make an API call to create the mapping
      // Example API call:
      // await createDrugMapping(mappingModal.selectedRecord.drugcode, mappingModal.selectedHospitalDrugId);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('เชื่อมโยงยาสำเร็จแล้ว');

      // Close modal and reset state
      setMappingModal({
        visible: false,
        selectedRecord: null,
        selectedHospitalDrugId: '',
        isMapping: false
      });

      // You might want to refresh the data here or update the local state
      message.info('กรุณารีเฟรชหน้าจอเพื่อดูข้อมูลที่อัปเดตแล้ว');
    } catch (error) {
      setMappingModal(prev => ({ ...prev, isMapping: false }));
      message.error('เกิดข้อผิดพลาดในการเชื่อมโยงยา');
    }
  }, [mappingModal.selectedHospitalDrugId]);

  const handleCancelMapping = useCallback(() => {
    setMappingModal({
      visible: false,
      selectedRecord: null,
      selectedHospitalDrugId: '',
      isMapping: false
    });
  }, []);

  const handleUpdateHospitalDrugId = useCallback((value: string) => {
    setMappingModal(prev => ({ ...prev, selectedHospitalDrugId: value }));
  }, []);

  return {
    mappingModal,
    handleOpenMappingModal,
    handleCreateMapping,
    handleCancelMapping,
    handleUpdateHospitalDrugId,
  };
};
