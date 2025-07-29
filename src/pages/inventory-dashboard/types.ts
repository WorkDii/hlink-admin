import { getInventoryDashboardData } from './hooks.controller';

// Main data types
export type InventoryDashboardData = Awaited<ReturnType<typeof getInventoryDashboardData>>;
export type DrugData = InventoryDashboardData['drugData'];
export type DrugStatus = InventoryDashboardData['drugStatus'];
export type HistoricalDrugRatio = InventoryDashboardData['historicalDrugRatio'];

// Filter types
export type FilterType = 'all' | 'linked' | 'unlinked';

// Status priority mapping
export const STATUS_PRIORITY: Record<string, number> = {
  'วิกฤต': 1,
  'ต่ำ': 2,
  'เหมาะสม': 3,
  'เกิน': 4,
  'มากเกินไป': 5
};

// Drug type mapping
export const DRUG_TYPE_MAP: Record<string, string> = {
  '01': 'ยาแผนปัจจุบัน',
  '04': 'ยา คุมกำเนิด',
  '10': 'ยาสมุนไพร',
}; 