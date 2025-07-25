import { useState, useEffect } from 'react';
import { directusClient } from "../../directusClient";
import { readItems, readItem } from "@directus/sdk";
import { Ou } from "../../type";

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
  };
}

export interface InventoryDashboardData {
  totalInventoryValue: number;
  totalItems: number;
  lowStockItems: number;
  stockOutItems: number;
  avgTurnoverRate: number;
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
    beginning: number;
    received: number;
    issued: number;
    remaining: number;
    turnoverRate: number;
  }>;
  lowStockAlert: Array<{
    name: string;
    remaining: number;
    turnoverRate: number;
    status: 'low' | 'critical';
  }>;
}

export type OuWithWarehouse = Ou & { warehouse: { id: number, warehouse_id: string }[] }

export async function getInventoryDashboardData(ou: OuWithWarehouse): Promise<InventoryDashboardData> {
  // Get detailed inventory data
  const inventoryDetails = await directusClient.request<InventoryDrugDetail[]>(
    // @ts-ignore
    readItems("inventory_drug_detail", {
      limit: -1,
      filter: {
        pcucode: {
          _eq: ou.id,
        },
      },
      fields: [
        '*',
        {
          hospital_drug: ['id', 'name', 'cost']
        }
      ]
    })
  );

  if (!inventoryDetails || inventoryDetails.length === 0) {
    return {
      totalInventoryValue: 0,
      totalItems: 0,
      lowStockItems: 0,
      stockOutItems: 0,
      avgTurnoverRate: 0,
      topIssuedDrugs: [],
      inventoryByType: [],
      stockMovementAnalysis: [],
      lowStockAlert: []
    };
  }

  // Calculate total inventory value
  const totalInventoryValue = inventoryDetails.reduce((sum, item) => {
    const cost = item.hospital_drug?.cost || 0;
    return sum + (item.remaining * cost);
  }, 0);

  // Count items
  const totalItems = inventoryDetails.length;
  const stockOutItems = inventoryDetails.filter(item => item.remaining <= 0).length;
  
  // Calculate turnover rates and identify low stock
  const itemsWithTurnover = inventoryDetails.map(item => ({
    ...item,
    turnoverRate: item.beginning > 0 ? item.issued / item.beginning : 0
  }));

  const avgTurnoverRate = itemsWithTurnover.reduce((sum, item) => sum + item.turnoverRate, 0) / itemsWithTurnover.length;
  
  // Low stock threshold based on turnover rate
  const lowStockItems = itemsWithTurnover.filter(item => {
    const threshold = item.turnoverRate * 30; // 30 days worth
    return item.remaining < threshold && item.remaining > 0;
  }).length;

  // Top issued drugs
  const topIssuedDrugs = inventoryDetails
    .filter(item => item.hospital_drug?.name)
    .sort((a, b) => b.issued - a.issued)
    .slice(0, 10)
    .map(item => ({
      name: item.hospital_drug.name,
      issued: item.issued,
      drugtype: item.drugtype || 'ไม่ระบุ'
    }));

  // Inventory by drug type
  const typeGroups = inventoryDetails.reduce((groups, item) => {
    const type = item.drugtype || 'ไม่ระบุ';
    if (!groups[type]) {
      groups[type] = { totalValue: 0, itemCount: 0 };
    }
    const cost = item.hospital_drug?.cost || 0;
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
  const stockMovementAnalysis = inventoryDetails
    .filter(item => item.hospital_drug?.name)
    .sort((a, b) => b.issued - a.issued)
    .slice(0, 20)
    .map(item => ({
      name: item.hospital_drug.name,
      beginning: item.beginning,
      received: item.received,
      issued: item.issued,
      remaining: item.remaining,
      turnoverRate: item.beginning > 0 ? item.issued / item.beginning : 0
    }));

  // Low stock alerts
  const lowStockAlert = itemsWithTurnover
    .filter(item => {
      const threshold = item.turnoverRate * 30; // 30 days worth
      return item.remaining < threshold && item.remaining > 0 && item.hospital_drug?.name;
    })
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 10)
    .map(item => ({
      name: item.hospital_drug.name,
      remaining: item.remaining,
      turnoverRate: item.turnoverRate,
      status: (item.remaining < item.turnoverRate * 10 ? 'critical' : 'low') as 'low' | 'critical'
    }));

  return {
    totalInventoryValue,
    totalItems,
    lowStockItems,
    stockOutItems,
    avgTurnoverRate,
    topIssuedDrugs,
    inventoryByType,
    stockMovementAnalysis,
    lowStockAlert
  };
}

export const useInventoryDashboardData = (pcucode: string | undefined) => {
  const [data, setData] = useState<InventoryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ou, setOu] = useState<OuWithWarehouse | null>(null);

  // Fetch OU data
  useEffect(() => {
    if (!pcucode) return;
    directusClient.request<OuWithWarehouse>(
      // @ts-ignore
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