import { InventoryDrugDetail, ItemWithReserveRatio, DrugTypeGroup } from './types';

/**
 * Maps drug type codes to their display names
 */
export const getDrugTypeName = (drugtype: string): string => {
  const drugTypeMap: { [key: string]: string } = {
    '01': 'ยาแผนปัจจุบัน',
    '04': 'ยา คุมกำเนิด',
    '10': 'ยาสมุนไพร',
  };
  return drugTypeMap[drugtype] || 'ไม่ระบุ';
};

/**
 * Calculates total inventory value from inventory details
 */
export const calculateTotalInventoryValue = (inventoryDetails: InventoryDrugDetail[]): number => {
  return inventoryDetails.reduce((sum, item) => {
    const cost =
      typeof item.hospital_drug === "object" && item.hospital_drug !== null
        ? (item.hospital_drug as { cost?: number }).cost ?? 0
        : 0;
    return sum + (item.remaining * cost);
  }, 0);
};

/**
 * Calculates reserve ratios for inventory items
 */
export const calculateReserveRatios = (inventoryDetails: InventoryDrugDetail[]): ItemWithReserveRatio[] => {
  return inventoryDetails.map(item => {
    const issued30day = item.issued30day ?? 0;
    return {
      ...item,
      reserveRatio: issued30day > 0 ? (item.remaining / issued30day) * 30 : item.remaining > 0 ? 999 : 0
    };
  });
};

/**
 * Gets top issued drugs from inventory details
 */
export const getTopIssuedDrugs = (inventoryDetails: InventoryDrugDetail[], limit: number = 10) => {
  return inventoryDetails
    .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
    .sort((a, b) => (b.issued30day ?? 0) - (a.issued30day ?? 0))
    .slice(0, limit)
    .map(item => ({
      name: (item.hospital_drug as { name: string }).name,
      issued30day: item.issued30day ?? 0,
      drugtype: item.drugtype || 'ไม่ระบุ'
    }));
};

/**
 * Groups inventory by drug type and calculates totals
 */
export const groupInventoryByType = (inventoryDetails: InventoryDrugDetail[]) => {
  const typeGroups = inventoryDetails.reduce((groups, item) => {
    const type = item.drugtype || 'ไม่ระบุ';
    if (!groups[type]) {
      groups[type] = { totalValue: 0, itemCount: 0 };
    }
    const cost =
      typeof item.hospital_drug === "object" && item.hospital_drug !== null
        ? item.hospital_drug.cost ?? 0
        : 0;
    groups[type].totalValue += item.remaining * cost;
    groups[type].itemCount += 1;
    return groups;
  }, {} as Record<string, DrugTypeGroup>);

  return Object.entries(typeGroups)
    .map(([drugtype, data]) => ({
      drugtype,
      totalValue: data.totalValue,
      itemCount: data.itemCount
    }))
    .sort((a, b) => b.totalValue - a.totalValue);
};

/**
 * Generates stock movement analysis data
 */
export const generateStockMovementAnalysis = (itemsWithReserveRatio: ItemWithReserveRatio[]) => {
  return itemsWithReserveRatio
    .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
    .sort((a, b) => (b.issued30day ?? 0) - (a.issued30day ?? 0))
    .map(item => {
      const cost = (item.hospital_drug as { cost?: number }).cost ?? 0;
      const issued30day = item.issued30day ?? 0;
      const drugRatio = issued30day > 0 ? item.remaining / issued30day : item.remaining > 0 ? 999 : 0;

      return {
        name: (item.hospital_drug as { name: string }).name,
        drugtype_name: getDrugTypeName(item.drugtype || ''),
        remaining: item.remaining,
        remainingValue: item.remaining * cost,
        unitPrice: cost,
        issued30day: issued30day,
        drugRatio: drugRatio
      };
    });
};

/**
 * Generates low stock alerts
 */
export const generateLowStockAlerts = (itemsWithReserveRatio: ItemWithReserveRatio[], limit: number = 10) => {
  return itemsWithReserveRatio
    .filter(item => {
      return (
        item.reserveRatio < 30 &&
        item.remaining > 0 &&
        typeof item.hospital_drug === "object" &&
        item.hospital_drug !== null &&
        !!item.hospital_drug.name
      );
    })
    .sort((a, b) => a.reserveRatio - b.reserveRatio)
    .slice(0, limit)
    .map(item => ({
      name: (item.hospital_drug as { name: string }).name,
      remaining: item.remaining,
      reserveRatio: item.reserveRatio,
      status: (item.reserveRatio < 15 ? 'critical' : 'low') as 'low' | 'critical'
    }));
};

/**
 * Calculates drug ratio statistics for a given date's data
 */
export const calculateDrugRatioStats = (items: InventoryDrugDetail[]) => {
  let totalRemain = 0;
  let totalIssued30day = 0;
  let critical = 0;
  let low = 0;
  let optimal = 0;
  let excess = 0;

  items.forEach(item => {
    totalRemain += Number(item.remaining);
    totalIssued30day += Number(item.issued30day);
    const drugRatio = item.issued30day ?? 0 > 0 ? item.remaining / Number(item.issued30day) : item.remaining > 0 ? 999 : 0;
    const { key } = getDrugRatioStatus(drugRatio);
    switch (key) {
      case 'critical':
        critical += 1;
        break;
      case 'low':
        low += 1;
        break;
      case 'optimal':
        optimal += 1;
        break;
      case 'excess':
        excess += 1;
        break;
    }
  });

  const totalRatio = totalIssued30day > 0 ? totalRemain / totalIssued30day : 0;
  return {
    totalRemain,
    totalIssued30day,
    ratio: Math.floor(totalRatio * 100) / 100,
    critical,
    low,
    optimal,
    excess,
    totalDrungs: items.length
  };
};

/**
 * Determines drug ratio status for individual drug history
 */
export const getDrugRatioStatusForHistory = (drugRatio: number): 'critical' | 'low' | 'optimal' | 'excess' => {
  if (drugRatio >= 2.0 && drugRatio < 999) {
    return 'excess';
  } else if (drugRatio >= 1.2 && drugRatio < 2.0) {
    return 'optimal';
  } else if (drugRatio >= 0.5 && drugRatio < 1.2) {
    return 'low';
  } else {
    return 'critical';
  }
};


export interface DrugRatioStatus {
  color: string;
  status: string;
  key: 'critical' | 'low' | 'optimal' | 'excess';
}
export function getDrugRatioStatus(ratio: number): DrugRatioStatus {
  let color = '#ff4d4f'; // red
  let status = 'ต่ำ';
  let key: DrugRatioStatus['key'] = 'low'

  if (ratio >= 2.0) {
    color = '#faad14'; // orange - สต็อกเกิน
    status = 'สต็อกเกิน';
    key = 'excess'
  } else if (ratio >= 1 && ratio < 2.0) {
    color = '#52c41a'; // green - เหมาะสม
    status = 'เหมาะสม';
    key = 'optimal'
  } else if (ratio >= 0.5 && ratio < 1) {
    color = '#faad14'; // orange - ต่ำ
    status = 'ต่ำ';
    key = 'low'
  } else {
    color = '#ff4d4f'; // red - วิกฤต
    status = 'วิกฤต';
    key = 'critical'
  }

  return { color, status, key };
}
