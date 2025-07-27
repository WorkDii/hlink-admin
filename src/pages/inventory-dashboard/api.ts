import { directusClient } from "../../directusClient";
import { readItems } from '@tspvivek/refine-directus';
import {
  InventoryDrugDetail,
  InventoryDashboardData,
  OuWithWarehouse
} from './types';
import {
  calculateTotalInventoryValue,
  calculateReserveRatios,
  getTopIssuedDrugs,
  groupInventoryByType,
  generateStockMovementAnalysis,
  generateLowStockAlerts,
  calculateDrugRatioStats,
  getDrugRatioStatusForHistory,
  getDrugTypeName,
  getSimpleStockStatus
} from './utils';

/**
 * Fetches the latest available date for inventory data
 */
export const getLatestInventoryDate = async (pcucode: string): Promise<string | null> => {
  const lastDateResult = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: pcucode },
        drugtype: { _in: ['01', '04', '10'] },
        hospital_drug: {
          _nnull: true
        }
      },
      sort: ['-date'],
      limit: 1,
      fields: ['date'],
    })
  );

  if (lastDateResult && lastDateResult.length > 0) {
    const date = lastDateResult[0].date;
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  }
  return null;
};

/**
 * Fetches inventory details for a specific date
 */
export const getInventoryDetails = async (pcucode: string, date: string): Promise<InventoryDrugDetail[]> => {
  const inventoryDetails = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: pcucode },
        drugtype: { _in: ['01', '04', '10'] },
        date: { _eq: date },
        hospital_drug: {
          _nnull: true
        }
      },
      fields: ['*', {
        hospital_drug: ['id', 'name', 'cost']
      }],
      limit: -1
    })
  );

  return (inventoryDetails || []) as InventoryDrugDetail[];
};

/**
 * Fetches drugs without hospital data
 */
export const getDrugsWithoutHospitalData = async (pcucode: string, date: string) => {
  const drugsWithoutHospitalDataRaw = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: pcucode },
        drugtype: { _in: ['01', '04', '10'] },
        date: { _eq: date },
        hospital_drug: {
          _null: true
        }
      },
      fields: ['drugcode', 'drugtype', 'unitsellname', 'issued30day', 'remaining', 'date'],
      limit: -1
    })
  );

  // Process drugs without hospital data - only include those with usage
  return (drugsWithoutHospitalDataRaw || [])
    .filter(item => (item.issued30day || 0) > 0)
    .map(item => ({
      drugcode: item.drugcode || '',
      drugtype: item.drugtype || '',
      unitsellname: item.unitsellname || '',
      issued30day: item.issued30day || 0,
      remaining: item.remaining || 0,
      lastUsedDate: item.date ? item.date.toString() : ''
    }))
    .sort((a, b) => b.issued30day - a.issued30day);
};

/**
 * Fetches all historical inventory data for drug ratio analysis
 */
export const getHistoricalInventoryData = async (pcucode: string): Promise<InventoryDrugDetail[]> => {
  const historicalData = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: pcucode },
        drugtype: { _in: ['01', '04', '10'] },
        hospital_drug: {
          _nnull: true
        }
      },
      fields: ['*', {
        hospital_drug: ['id', 'name', 'cost']
      }],
      limit: -1
    })
  );

  return (historicalData || []) as InventoryDrugDetail[];
};

/**
 * Calculates total drug ratio history from historical data
 */
export const calculateTotalDrugRatioHistory = (historicalData: InventoryDrugDetail[]) => {
  // Group historical data by date
  const dataByDate = historicalData.reduce((groups, item) => {
    const date = item.date ? item.date.toString() : '';
    if (date && !groups[date]) {
      groups[date] = [];
    }
    if (date) {
      groups[date].push(item);
    }
    return groups;
  }, {} as Record<string, InventoryDrugDetail[]>);

  // Calculate total drug ratio history
  return Object.entries(dataByDate)
    .map(([date, items]) => ({
      date,
      ...calculateDrugRatioStats(items)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Fetches drug ratio history for individual drugs
 */
export const getDrugRatioHistoryByDrug = async (pcucode: string, topDrugs: InventoryDrugDetail[]) => {
  return Promise.all(
    topDrugs.map(async (drug) => {
      const drugHistory = await directusClient.request(
        readItems("inventory_drug_detail", {
          filter: {
            pcucode: { _eq: pcucode },
            drugcode: { _eq: drug.drugcode },
            hospital_drug: {
              _nnull: true
            }
          },
          fields: ['date', 'remaining', 'issued30day'],
          sort: ['date'],
          limit: -1
        })
      );

      const history = (drugHistory || []).map(item => {
        const issued30day = item.issued30day ?? 0;
        const drugRatio = issued30day > 0 ? item.remaining / issued30day : item.remaining > 0 ? 999 : 0;
        const status = getDrugRatioStatusForHistory(drugRatio);
        return {
          date: item.date ? item.date.toString() : '',
          drugRatio: Math.floor(drugRatio * 100) / 100,
          remaining: item.remaining,
          issued30day,
          status
        };
      });

      return {
        drugName: (drug.hospital_drug as { name: string }).name,
        drugCode: drug.drugcode || '',
        drugType: getDrugTypeName(drug.drugtype || ''),
        history
      };
    })
  );
};

/**
 * Calculates basic inventory metrics
 */
export const calculateBasicMetrics = (inventoryDetails: InventoryDrugDetail[]) => {
  const itemsWithReserveRatio = calculateReserveRatios(inventoryDetails);

  const totalInventoryValue = calculateTotalInventoryValue(inventoryDetails);
  const totalItems = inventoryDetails.length;
  const stockOutItems = inventoryDetails.filter(item => item.remaining <= 0).length;

  const lowStockItems = itemsWithReserveRatio.filter(item =>
    item.remaining > 0 && getSimpleStockStatus(item.reserveRatio) !== 'sufficient'
  ).length;

  return {
    totalInventoryValue,
    totalItems,
    stockOutItems,
    lowStockItems,
    itemsWithReserveRatio
  };
};

/**
 * Main function to get complete inventory dashboard data
 */
export async function getInventoryDashboardData(ou: OuWithWarehouse): Promise<InventoryDashboardData> {
  try {
    // Get the latest available date
    const lastDate = await getLatestInventoryDate(ou.id);

    // If no data exists, return empty dashboard
    if (!lastDate) {
      return {
        totalInventoryValue: 0,
        totalItems: 0,
        lowStockItems: 0,
        stockOutItems: 0,
        topIssuedDrugs: [],
        inventoryByType: [],
        stockMovementAnalysis: [],
        lowStockAlert: [],
        drugsWithoutHospitalData: [],
        totalDrugRatioHistory: [],
        drugRatioHistoryByDrug: []
      };
    }

    // Fetch current inventory details
    const inventoryDetails = await getInventoryDetails(ou.id, lastDate);

    if (inventoryDetails.length === 0) {
      return {
        totalInventoryValue: 0,
        totalItems: 0,
        lowStockItems: 0,
        stockOutItems: 0,
        topIssuedDrugs: [],
        inventoryByType: [],
        stockMovementAnalysis: [],
        lowStockAlert: [],
        drugsWithoutHospitalData: [],
        totalDrugRatioHistory: [],
        drugRatioHistoryByDrug: []
      };
    }

    // Calculate basic metrics
    const {
      totalInventoryValue,
      totalItems,
      stockOutItems,
      lowStockItems,
      itemsWithReserveRatio
    } = calculateBasicMetrics(inventoryDetails);

    // Generate analysis data
    const topIssuedDrugs = getTopIssuedDrugs(inventoryDetails);
    const inventoryByType = groupInventoryByType(inventoryDetails);
    const stockMovementAnalysis = generateStockMovementAnalysis(itemsWithReserveRatio);
    const lowStockAlert = generateLowStockAlerts(itemsWithReserveRatio);

    // Fetch drugs without hospital data
    const drugsWithoutHospitalData = await getDrugsWithoutHospitalData(ou.id, lastDate);

    // Get historical data for drug ratio analysis
    const historicalData = await getHistoricalInventoryData(ou.id);
    const totalDrugRatioHistory = calculateTotalDrugRatioHistory(historicalData);

    // Get top drugs for individual drug ratio history
    const topDrugsForHistory = inventoryDetails
      .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
      .sort((a, b) => (b.issued30day ?? 0) - (a.issued30day ?? 0))
      .slice(0, 50);

    const drugRatioHistoryByDrug = await getDrugRatioHistoryByDrug(ou.id, topDrugsForHistory);

    return {
      totalInventoryValue,
      totalItems,
      lowStockItems,
      stockOutItems,
      topIssuedDrugs,
      inventoryByType,
      stockMovementAnalysis,
      lowStockAlert,
      drugsWithoutHospitalData,
      totalDrugRatioHistory,
      drugRatioHistoryByDrug
    };

  } catch (error) {
    console.error('Error fetching inventory dashboard data:', error);
    throw error;
  }
} 