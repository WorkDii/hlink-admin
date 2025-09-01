
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  location: null;
  title: null;
  description: null;
  tags: null;
  language: null;
  tfa_secret: null;
  status: string;
  token: string;
  last_access: Date;
  last_page: null;
  provider: string;
  external_identifier: null;
  auth_data: null;
  email_notifications: boolean;
  appearance: null;
  theme_dark: null;
  theme_light: null;
  theme_light_overrides: null;
  theme_dark_overrides: null;
  avatar: null;
  role: Role;
  ou: Ou;
}

export interface Ou {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated: string;
  date_updated: Date;
  name: string;
  drug_stock_parent?: string;
  date_reset_drug_stock?: string;
  warehouse: number
}

export interface Role {
  id: string;
  name: string;
  icon: string;
  description: string;
  ip_access: null;
  enforce_tfa: boolean;
  admin_access: boolean;
  app_access: boolean;
  users: string[];
}

export interface HospitalDrug {
  id: string;
  user_created: string;
  date_created: string;
  user_updated: string;
  date_updated: string;
  drugcode24: string;
  name: string;
  is_active: boolean;
  hcode: string;
  default_unit: string;
  ncd_cup: boolean;
  prepack: number;
  h_drugcode: string;
  warehouse: string;
  cost: string;
  pcu2hospital_drug_mapping: string[];
}

export interface HospitalDrugRate {
  id: string;
  pcucode: string;
  usage_rate_30_day_ago: number;
  hospital_drug: string;
  date_updated: string;
}

export interface InventoryDrug {
  id: string;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  quantity: number;
  note: string | null;
  inventory_bill: string;
  confirm_quantity: number;
  expire_date: string;
  pack_ratio: number;
  lot_no: string | null;
  cost: string;
  hospital_drug: HospitalDrug;
}


export interface InventoryBillItem {
  id: string;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  bill_id: string;
  hcode: string;
  pcucode: string;
  status: string;
  request_id: string;
  inventory_request: string;
  inventory_drug: InventoryDrug[];
  bill_warehouse: string;
}

export interface InventoryRequest {
  id: string;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  status: string;
  request_id: string;
  hcode: string;
  pcucode: string;
  inventory_request_drug: InventoryRequestDrug[];
  bill_warehouse: string;
}

export interface InventoryRequestDrug {
  id: string;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  note: string | null;
  inventory_request: string;
  current_rate: number;
  current_remain: number;
  quantity: number;
  current_prepack: number;
  hospital_drug: HospitalDrug;
}

export interface Cdrug {
  id: string;
  drugcode: string;
  drugname: string;
  unitsell?: string;
  unitusage?: string;
  drugcode24: string;
  tmtcode?: string;
  pcucode: string;
  lotunit?: string;
  packunit?: string;
}