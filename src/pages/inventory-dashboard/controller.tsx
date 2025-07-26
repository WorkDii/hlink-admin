import { useState, useEffect } from 'react';
import { directusClient } from "../../directusClient";
import { Ou } from "../../type";
import { readItems, readItem } from '@tspvivek/refine-directus';

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
    issued: number;
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
      lowStockAlert: []
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
      lowStockAlert: []
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

  // Calculate reserve ratios (remaining/issued * 30 days)
  const itemsWithReserveRatio = inventoryDetails.map(item => ({
    ...item,
    reserveRatio: item.issued > 0 ? (item.remaining / item.issued) * 30 : item.remaining > 0 ? 999 : 0
  }));

  const avgReserveRatio = itemsWithReserveRatio.reduce((sum, item) => sum + item.reserveRatio, 0) / itemsWithReserveRatio.length;

  // Low stock items: those with less than 30 days of reserve
  const lowStockItems = itemsWithReserveRatio.filter(item => {
    return item.reserveRatio < 30 && item.remaining > 0;
  }).length;

  // Top issued drugs
  const topIssuedDrugs = inventoryDetails
    .filter(item => typeof item.hospital_drug === "object" && item.hospital_drug !== null && !!item.hospital_drug.name)
    .sort((a, b) => b.issued - a.issued)
    .slice(0, 10)
    .map(item => ({
      name: (item.hospital_drug as { name: string }).name,
      issued: item.issued,
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

  return {
    totalInventoryValue,
    totalItems,
    lowStockItems,
    stockOutItems,
    avgReserveRatio,
    topIssuedDrugs,
    inventoryByType,
    stockMovementAnalysis,
    lowStockAlert
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