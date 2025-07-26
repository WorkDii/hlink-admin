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
  issued30day?: number;
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

export type OuWithWarehouse = Ou & {
  warehouse: { id: number, warehouse_id: string }[]
};

export interface ItemWithReserveRatio extends InventoryDrugDetail {
  reserveRatio: number;
}

export interface DrugTypeGroup {
  totalValue: number;
  itemCount: number;
} 