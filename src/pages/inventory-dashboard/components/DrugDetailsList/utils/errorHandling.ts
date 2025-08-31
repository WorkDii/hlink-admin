import { message } from 'antd';
import { DrugRecord } from '../types';

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NO_DATA: 'ไม่มีข้อมูล',
  INVALID_DATA: 'ข้อมูลไม่ถูกต้อง',
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย',
  MAPPING_FAILED: 'เกิดข้อผิดพลาดในการเชื่อมโยงยา',
  NO_SELECTION: 'กรุณาเลือกยาที่ต้องการเชื่อมโยง',
  EXPORT_FAILED: 'เกิดข้อผิดพลาดในการส่งออกไฟล์',
  SEARCH_FAILED: 'เกิดข้อผิดพลาดในการค้นหา',
} as const;

export const SUCCESS_MESSAGES = {
  MAPPING_SUCCESS: 'เชื่อมโยงยาสำเร็จแล้ว',
  EXPORT_SUCCESS: 'ส่งออกไฟล์สำเร็จแล้ว',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate if drug data is valid
 */
export const isValidDrugData = (data: unknown): data is DrugRecord[] => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Validate if a drug record has required fields
 */
export const isValidDrugRecord = (record: unknown): record is DrugRecord => {
  if (!record || typeof record !== 'object') return false;

  const drugRecord = record as any;
  return (
    typeof drugRecord.id === 'string' &&
    typeof drugRecord.drugcode === 'string' &&
    typeof drugRecord.drugtype === 'string' &&
    typeof drugRecord.remaining === 'number' &&
    typeof drugRecord.issued30day === 'number' &&
    drugRecord.ratio &&
    typeof drugRecord.ratio.value === 'number' &&
    typeof drugRecord.ratio.days === 'number' &&
    typeof drugRecord.ratio.status === 'string'
  );
};

/**
 * Validate search text input
 */
export const isValidSearchText = (text: string): boolean => {
  return typeof text === 'string' && text.trim().length >= 0;
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error: unknown, context?: string): void => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      message.error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      message.error(`${context ? `${context}: ` : ''}${error.message}`);
    }
  } else {
    message.error(ERROR_MESSAGES.INVALID_DATA);
  }
};

/**
 * Handle validation errors
 */
export const handleValidationError = (field: string, value?: unknown): void => {
  console.warn(`Validation failed for ${field}:`, value);
  message.warning(`ข้อมูล${field}ไม่ถูกต้อง`);
};

/**
 * Safely execute async operations with error handling
 */
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, errorContext);
    return null;
  }
};

/**
 * Validate and sanitize filter type
 */
export const sanitizeFilterType = (filterType: unknown): string => {
  if (typeof filterType === 'string' && ['all', 'linked', 'unlinked'].includes(filterType)) {
    return filterType;
  }
  return 'all';
};

/**
 * Validate and sanitize page size
 */
export const sanitizePageSize = (pageSize: unknown): number => {
  if (typeof pageSize === 'number' && pageSize > 0 && pageSize <= 200) {
    return pageSize;
  }
  return 50; // Default page size
};
