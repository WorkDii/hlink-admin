// Re-export types from parent module for consistency
export { STATUS_PRIORITY, DRUG_TYPE_MAP } from '../../types';

// ============================================================================
// TABLE CONFIGURATION
// ============================================================================

/**
 * Column widths for the drug data table
 */
export const TABLE_COLUMN_WIDTHS = {
  DRUG_CODE: 100,
  DRUG_NAME: 250,
  DRUG_TYPE: 100,
  REMAINING: 100,
  ISSUED_30_DAY: 100,
  RATIO: 120,
  DAYS: 100,
  STATUS: 120,
  COST: 120,
  TOTAL_VALUE: 150,
} as const;

/**
 * Table scroll configuration
 */
export const TABLE_SCROLL = { x: 1200, y: 600 } as const;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE_SIZE = 50;

// ============================================================================
// VISUAL STYLING
// ============================================================================

/**
 * Background colors for different drug status levels
 */
export const STATUS_COLORS = {
  'วิกฤต': '#fff2f0',
  'ต่ำ': '#fffbe6',
  'เหมาะสม': '#f0f5ff',
} as const;

// ============================================================================
// FILTER AND DISPLAY LABELS
// ============================================================================

/**
 * Display labels for filter types
 */
export const FILTER_TYPE_LABELS: Record<string, string> = {
  all: 'ทั้งหมด',
  linked: 'เชื่อมโยงแล้ว',
  unlinked: 'ยังไม่เชื่อมโยง',
} as const;

// ============================================================================
// CSV EXPORT CONFIGURATION
// ============================================================================

/**
 * Headers for CSV export file
 */
export const CSV_HEADERS = [
  'รหัสยา',
  'ชื่อยา',
  'ประเภทยา',
  'คงเหลือ',
  'ใช้ 30 วัน',
  'อัตราส่วน (เดือน)',
  'วันคงเหลือ',
  'สถานะ',
  'ราคา/หน่วย (บาท)',
  'มูลค่าคงเหลือ (บาท)'
] as const;

// ============================================================================
// MODAL CONFIGURATION
// ============================================================================

/**
 * Modal styling constants
 */
export const MODAL_STYLES = {
  WIDTH: 600,
  PLACEHOLDER_HEIGHT: 200,
} as const;

// ============================================================================
// SEARCH AND PAGINATION
// ============================================================================

/**
 * Debounce delay for search operations (milliseconds)
 */
export const SEARCH_DEBOUNCE_DELAY = 500;

/**
 * Maximum items to show in dropdown lists
 */
export const MAX_DROPDOWN_ITEMS = 20;
