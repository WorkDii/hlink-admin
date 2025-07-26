import { useState, useEffect } from 'react';
import { directusClient } from "../../directusClient";
import { Ou } from "../../type";
import { readItems, readItem } from '@tspvivek/refine-directus';
import { getDrugRatioStatus } from '../../utils';

// Drug type mapping function
const getDrugTypeName = (drugtype: string): string => {
  const drugTypeMap: { [key: string]: string } = {
    '01': 'ยาแผนปัจจุบัน',
    '04': 'ยา คุมกำเนิด',
    '10': 'ยาสมุนไพร',
  };
  return drugTypeMap[drugtype] || 'ไม่ระบุ';
};

export interface InventoryDrugDetail {
  id: string;
  pcucode: string;
  drugcode: string;
  drugtype: string;
  unitsellcode: string;
  unitsellname: string;
  date: string;
  beginning: number;
  received: number;
  issued: number;
  issued30day?: number; // Add issued30day as optional, since we use it
  remaining: number;
  hospital_drug: {
    id: string;
    name: string;
    cost: number;
  } | null;
}

export interface InventoryDashboardData {
  totalInventoryValue: number;
  totalItems: number;
  lowStockItems: number;
  stockOutItems: number;
  avgReserveRatio: number;
  topIssuedDrugs: Array<{
    name: string;
    issued30day: number;
    drugtype: string;
  }>;
  inventoryByType: Array<{
    drugtype: string;
    totalValue: number;
    itemCount: number;
  }>;
  stockMovementAnalysis: Array<{
    name: string;
    drugtype_name: string;
    remaining: number;
    remainingValue: number;
    unitPrice: number;
    issued30day: number;
    drugRatio: number;
  }>;
  lowStockAlert: Array<{
    name: string;
    remaining: number;
    reserveRatio: number;
    status: 'low' | 'critical';
  }>;
  drugsWithoutHospitalData: Array<{
    drugcode: string;
    drugtype: string;
    unitsellname: string;
    issued30day: number;
    remaining: number;
    lastUsedDate: string;
  }>;
  // New fields for drug ratio history
  totalDrugRatioHistory: Array<{
    date: string;
    totalRemain: number;
    totalIssued30day: number;
    ratio: number;
    critical: number;
    low: number;
    optimal: number;
    excess: number;
    totalDrungs: number;
  }>;
  drugRatioHistoryByDrug: Array<{
    drugName: string;
    drugCode: string;
    drugType: string;
    history: Array<{
      date: string;
      drugRatio: number;
      remaining: number;
      issued30day: number;
      status: 'critical' | 'low' | 'optimal' | 'excess';
    }>;
  }>;
}

export type OuWithWarehouse = Ou & { warehouse: { id: number, warehouse_id: string }[] }

export async function getInventoryDashboardData(ou: OuWithWarehouse): Promise<InventoryDashboardData> {
  // First, get the last available date for this OU from inventory_drug_detail
  const lastDateResult = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: ou.id },
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

  // If no data exists for this OU, return empty dashboard
  if (!lastDateResult || lastDateResult.length === 0) {
    return {
      totalInventoryValue: 0,
      totalItems: 0,
      lowStockItems: 0,
      stockOutItems: 0,
      avgReserveRatio: 0,
      topIssuedDrugs: [],
      inventoryByType: [],
      stockMovementAnalysis: [],
      lowStockAlert: [],
      drugsWithoutHospitalData: [],
      totalDrugRatioHistory: [],
      drugRatioHistoryByDrug: []
    };
  }

  const lastDate = lastDateResult[0].date;

  // Get detailed inventory data for the last date only
  const inventoryDetails = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: ou.id },
        drugtype: { _in: ['01', '04', '10'] },
        date: { _eq: lastDate },
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

  if (!inventoryDetails || inventoryDetails.length === 0) {
    return {
      totalInventoryValue: 0,
      totalItems: 0,
      lowStockItems: 0,
      stockOutItems: 0,
      avgReserveRatio: 0,
      topIssuedDrugs: [],
      inventoryByType: [],
      stockMovementAnalysis: [],
      lowStockAlert: [],
      drugsWithoutHospitalData: [],
      totalDrugRatioHistory: [],
      drugRatioHistoryByDrug: []
    };
  }
  // Calculate total inventory value
  const totalInventoryValue = inventoryDetails.reduce((sum, item) => {
    const cost =
      typeof item.hospital_drug === "object" && item.hospital_drug !== null
        ? (item.hospital_drug as { cost?: number }).cost ?? 0
        : 0;
    return sum + (item.remaining * cost);
  }, 0);

  // Count items
  const totalItems = inventoryDetails.length;
  const stockOutItems = inventoryDetails.filter(item => item.remaining <= 0).length;

  // Calculate reserve ratios (remaining/issued30day * 30 days)
  const itemsWithReserveRatio = inventoryDetails.map(item => {
    const issued30day = item.issued30day ?? 0;
    return {
      ...item,
      reserveRatio: issued30day > 0 ? (item.remaining / issued30day) * 30 : item.remaining > 0 ? 999 : 0
    };
  });

  const avgReserveRatio = itemsWithReserveRatio.reduce((sum, item) => sum + item.reserveRatio, 0) / itemsWithReserveRatio.length;

  // Low stock items: those with less than 30 days of reserve
  const lowStockItems = itemsWithReserveRatio.filter(item => {
    return item.reserveRatio < 30 && item.remaining > 0;
  }).length;

  // Top issued drugs (use issued30day, not issued)
  const topIssuedDrugs = inventoryDetails
    .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
    .sort((a, b) => (b.issued30day ?? 0) - (a.issued30day ?? 0))
    .slice(0, 10)
    .map(item => ({
      name: (item.hospital_drug as { name: string }).name,
      issued30day: item.issued30day ?? 0,
      drugtype: item.drugtype || 'ไม่ระบุ'
    }));

  // Inventory by drug type
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
  }, {} as Record<string, { totalValue: number; itemCount: number }>);

  const inventoryByType = Object.entries(typeGroups)
    .map(([drugtype, data]) => ({
      drugtype,
      totalValue: data.totalValue,
      itemCount: data.itemCount
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  // Stock movement analysis
  const stockMovementAnalysis = itemsWithReserveRatio
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

  // Low stock alerts - items with less than 30 days reserve
  const lowStockAlert = itemsWithReserveRatio
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
    .slice(0, 10)
    .map(item => ({
      name: (item.hospital_drug as { name: string }).name,
      remaining: item.remaining,
      reserveRatio: item.reserveRatio,
      status: (item.reserveRatio < 15 ? 'critical' : 'low') as 'low' | 'critical'
    }));

  // Fetch drugs without hospital data
  const drugsWithoutHospitalDataRaw = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: ou.id },
        drugtype: { _in: ['01', '04', '10'] },
        date: { _eq: lastDate },
        hospital_drug: {
          _null: true
        }
      },
      fields: ['drugcode', 'drugtype', 'unitsellname', 'issued30day', 'remaining', 'date'],
      limit: -1
    })
  );

  // Process drugs without hospital data - only include those with usage
  const drugsWithoutHospitalData = (drugsWithoutHospitalDataRaw || [])
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

  // Calculate drug ratio history (all available data)
  // Get all historical data
  const historicalData = await directusClient.request(
    readItems("inventory_drug_detail", {
      filter: {
        pcucode: { _eq: ou.id },
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

  // Group historical data by date
  const dataByDate = (historicalData || []).reduce((groups, item) => {
    const date = item.date ? item.date.toString() : '';
    if (date && !groups[date]) {
      groups[date] = [];
    }
    if (date) {
      groups[date].push(item);
    }
    return groups;
  }, {} as Record<string, typeof historicalData>);


  // Calculate total drug ratio history
  const totalDrugRatioHistory = Object.entries(dataByDate)
    .map(([date, items]) => {
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
        date,
        totalRemain,
        totalIssued30day,
        ratio: Math.floor(totalRatio * 100) / 100,
        critical,
        low,
        optimal,
        excess,
        totalDrungs: items.length
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate drug ratio history by each drug (top 10 most issued drugs)
  const topDrugs = inventoryDetails
    .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
    .sort((a, b) => (b.issued30day ?? 0) - (a.issued30day ?? 0))
    .slice(0, 10);

  const drugRatioHistoryByDrug = await Promise.all(
    topDrugs.map(async (drug) => {
      const drugHistory = await directusClient.request(
        readItems("inventory_drug_detail", {
          filter: {
            pcucode: { _eq: ou.id },
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

        let status: 'critical' | 'low' | 'optimal' | 'excess';
        if (drugRatio >= 2.0 && drugRatio < 999) {
          status = 'excess';
        } else if (drugRatio >= 1.2 && drugRatio < 2.0) {
          status = 'optimal';
        } else if (drugRatio >= 0.5 && drugRatio < 1.2) {
          status = 'low';
        } else {
          status = 'critical';
        }

        return {
          date: item.date ? item.date.toString() : '',
          drugRatio,
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

  return {
    totalInventoryValue,
    totalItems,
    lowStockItems,
    stockOutItems,
    avgReserveRatio,
    topIssuedDrugs,
    inventoryByType,
    stockMovementAnalysis,
    lowStockAlert,
    drugsWithoutHospitalData,
    totalDrugRatioHistory,
    drugRatioHistoryByDrug
  };
}

export const useInventoryDashboardData = (pcucode: string | undefined) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof getInventoryDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ou, setOu] = useState<OuWithWarehouse | null>(null);

  // Fetch OU data
  useEffect(() => {
    if (!pcucode) return;
    directusClient.request<OuWithWarehouse>(
      readItem("ou", pcucode, {
        fields: ['*', { 'warehouse': ['id', 'warehouse_id'] }]
      })
    ).then((result) => {
      if (result) {
        setOu(result);
      }
    }).catch(err => {
      setError(err instanceof Error ? err : new Error('Failed to fetch OU data'));
    });
  }, [pcucode]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!ou) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getInventoryDashboardData(ou);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ou]);

  return { data, loading, error, ou };
};