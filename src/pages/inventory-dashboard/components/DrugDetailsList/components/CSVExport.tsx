import { DRUG_TYPE_MAP } from '../../../types';
import { CSV_HEADERS, FILTER_TYPE_LABELS } from '../constants';
import { getDrugName, getDrugCost, getTotalValue, formatNumber, formatCurrency } from '../utils';

/**
 * Create CSV content for export
 */
export const createCSVContent = (data: any[], filterType: string): string => {
  const csvData = data.map(record => [
    record.drugcode,
    getDrugName(record),
    DRUG_TYPE_MAP[record.drugtype || ''] || record.drugtype,
    formatNumber(record.remaining),
    formatNumber(record.issued30day),
    record.ratio.value,
    record.ratio.days,
    record.ratio.status,
    formatCurrency(getDrugCost(record)),
    formatCurrency(getTotalValue(record))
  ]);

  return [
    CSV_HEADERS.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (data: any[], filterType: string): void => {
  const csvContent = createCSVContent(data, filterType);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  const filterLabel = FILTER_TYPE_LABELS[filterType] || filterType;

  link.setAttribute('href', url);
  link.setAttribute('download', `รายละเอียดยา_${filterLabel}_${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
