import { DRUG_TYPE_MAP, FilterType } from '../../types';
import { STATUS_COLORS } from './constants';
import { DrugRecord, HospitalDrug, FilteredDataResult } from './types';

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a drug is linked to hospital drug data
 */
export const isLinkedDrug = (hospitalDrug: HospitalDrug | null): hospitalDrug is HospitalDrug => {
  return hospitalDrug !== null && typeof hospitalDrug === 'object' && 'name' in hospitalDrug;
};

// ============================================================================
// DATA EXTRACTION UTILITIES
// ============================================================================

/**
 * Get drug name or "Not Linked" status
 */
export const getDrugName = (record: DrugRecord): string => {
  const hospitalDrug = record.hospital_drug;
  return isLinkedDrug(hospitalDrug) ? hospitalDrug.name : 'ไม่ได้เชื่อมโยง';
};

/**
 * Get drug cost from hospital drug data
 */
export const getDrugCost = (record: DrugRecord): number | null => {
  const hospitalDrug = record.hospital_drug;
  return isLinkedDrug(hospitalDrug) ? hospitalDrug.cost : null;
};

/**
 * Calculate total value (cost × remaining)
 */
export const getTotalValue = (record: DrugRecord): number | null => {
  const cost = getDrugCost(record);
  const remaining = record.remaining;
  return cost && remaining ? Number(cost) * Number(remaining) : null;
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number | null | undefined): string => {
  return value?.toLocaleString() || '0';
};

/**
 * Format currency in Thai Baht
 */
export const formatCurrency = (value: number | null | undefined): string => {
  return value ? `${Number(value).toLocaleString()} บาท` : 'ไม่มีข้อมูล';
};

/**
 * Get row background color based on status
 */
export const getRowBackgroundColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'transparent';
};

// ============================================================================
// DATA FILTERING AND SORTING
// ============================================================================

/**
 * Apply filters and search to drug data
 */
export const filterDrugData = (
  data: DrugRecord[],
  filterType: FilterType,
  searchText: string
): FilteredDataResult => {
  const linkedCount = data.filter(item => isLinkedDrug(item.hospital_drug)).length;
  const unlinkedCount = data.length - linkedCount;

  let filteredData = data;

  // Apply filter type
  switch (filterType) {
    case 'linked':
      filteredData = data.filter(item => isLinkedDrug(item.hospital_drug));
      break;
    case 'unlinked':
      filteredData = data.filter(item => !isLinkedDrug(item.hospital_drug));
      break;
    case 'all':
    default:
      // No filtering needed for 'all'
      break;
  }

  // Apply search filter
  if (searchText.trim()) {
    const searchLower = searchText.toLowerCase();
    filteredData = filteredData.filter(item => {
      const drugCode = (item.drugcode || '').toLowerCase();
      const drugName = getDrugName(item).toLowerCase();
      const drugType = (DRUG_TYPE_MAP[item.drugtype || ''] || item.drugtype || '').toLowerCase();
      const status = (item.ratio?.status || '').toLowerCase();

      return drugCode.includes(searchLower) ||
        drugName.includes(searchLower) ||
        drugType.includes(searchLower) ||
        status.includes(searchLower);
    });
  }

  return { filteredData, linkedCount, unlinkedCount };
};

/**
 * Sort data by status priority (critical first)
 */
export const sortDataByPriority = (
  data: DrugRecord[],
  STATUS_PRIORITY: Record<string, number>
): DrugRecord[] => {
  return [...data].sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.ratio.status] || 999;
    const priorityB = STATUS_PRIORITY[b.ratio.status] || 999;
    return priorityA - priorityB;
  });
};
