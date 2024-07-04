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
