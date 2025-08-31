import { useState, useCallback } from 'react';
import { message } from 'antd';
import { MappingModalState, DrugRecord } from '../types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  handleApiError,
  safeAsyncOperation
} from '../utils/errorHandling';

/**
 * Custom hook for managing drug mapping modal state and operations
 * 
 * Provides state management and handlers for the drug mapping functionality,
 * including modal visibility, selected records, and mapping operations.
 * 
 * @returns Object containing modal state and handler functions
 * 
 * @example
 * ```tsx
 * const {
 *   mappingModal,
 *   handleOpenMappingModal,
 *   handleCreateMapping,
 *   handleCancelMapping,
 *   handleUpdateHospitalDrugId,
 * } = useDrugMapping();
 * ```
 * 
 * Features:
 * - Modal state management with loading states
 * - Error handling for mapping operations
 * - Validation of required fields
 * - Async operation handling with user feedback
 */
export const useDrugMapping = () => {
  const [mappingModal, setMappingModal] = useState<MappingModalState>({
    visible: false,
    selectedRecord: null,
    selectedHospitalDrugId: '',
    isMapping: false
  });

  /**
   * Open the drug mapping modal for a specific record
   * @param record - The drug record to create a mapping for
   */
  const handleOpenMappingModal = useCallback((record: DrugRecord) => {
    setMappingModal({
      visible: true,
      selectedRecord: record,
      selectedHospitalDrugId: '',
      isMapping: false
    });
  }, []);

  /**
   * Create a new drug mapping with validation and error handling
   * Validates required fields, executes the mapping operation, and provides user feedback
   */
  const handleCreateMapping = useCallback(async () => {
    if (!mappingModal.selectedHospitalDrugId) {
      message.error(ERROR_MESSAGES.NO_SELECTION);
      return;
    }

    if (!mappingModal.selectedRecord) {
      message.error(ERROR_MESSAGES.INVALID_DATA);
      return;
    }

    setMappingModal(prev => ({ ...prev, isMapping: true }));

    const result = await safeAsyncOperation(
      async () => {
        // Here you would typically make an API call to create the mapping
        // Example API call:
        // await createDrugMapping(mappingModal.selectedRecord.drugcode, mappingModal.selectedHospitalDrugId);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      },
      'การเชื่อมโยงยา'
    );

    if (result) {
      message.success(SUCCESS_MESSAGES.MAPPING_SUCCESS);

      // Close modal and reset state
      setMappingModal({
        visible: false,
        selectedRecord: null,
        selectedHospitalDrugId: '',
        isMapping: false
      });

      // You might want to refresh the data here or update the local state
      message.info('กรุณารีเฟรชหน้าจอเพื่อดูข้อมูลที่อัปเดตแล้ว');
    } else {
      setMappingModal(prev => ({ ...prev, isMapping: false }));
    }
  }, [mappingModal.selectedHospitalDrugId, mappingModal.selectedRecord]);

  /**
   * Cancel the mapping operation and close the modal
   * Resets all modal state to initial values
   */
  const handleCancelMapping = useCallback(() => {
    setMappingModal({
      visible: false,
      selectedRecord: null,
      selectedHospitalDrugId: '',
      isMapping: false
    });
  }, []);

  /**
   * Update the selected hospital drug ID
   * @param value - The new hospital drug ID
   */
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
