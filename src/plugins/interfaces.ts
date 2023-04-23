import type { AxiosError, AxiosInstance } from 'axios';

// For db commands
export interface apiResponse {
  (data: object | Array<object> | string, err: Error | AxiosError | null): void;
}

// For axios.ts
export interface AxiosOptions {
  baseUrl?: string;
  token?: string;
}

// For message component
export interface Message {
  text: string;
  quantity: number;
}

export interface LoadedPartRecord {
  record: PartRecord;
  by: User;
  owner?: User;
}

// Database part schema
export interface PartSchema {
  [index: string]: any;
  _id?: string;
  nxid?: string;
  manufacturer?: string;
  name?: string;
  type?: string;
  quantity?: number;
  total_quantity?: number;
  shelf_location?: string;
  frequency?: number;
  chipset?: string;
  memory_type?: string;
  memory_gen?: string;
  peripheral_type?: string;
  storage_interface?: string;
  capacity?: number;
  capacity_unit?: string;
  num_ports?: number;
  port_type?: string;
  cable_end1?: string;
  cable_end2?: string;
  serialized?: boolean;
  serials?: string[];
}
export interface AssetSchema {
  [index: string]: any;
  _id?: string;
  asset_tag?: string;
  prev?: string | null;
  next?: string | null;
  building?: number;
  asset_type?: string;
  chassis_type?: string;
  manufacturer?: string;
  model?: string;
  serial?: string;
  rails?: Boolean;
  live?: Boolean;
  in_rack?: Boolean;
  bay?: string | number;
  power_port?: string;
  public_port?: string;
  private_port?: string;
  ipmi_port?: string;
  by?: string;
  sid?: number;
  notes?: string;
  date_created?: string;
  date_replaced?: string;
}

export interface PartRecord {
  _id?: string;
  nxid?: string;
  prev?: string;
  next?: string | null;
  building?: Number;
  location?: string;
  asset_tag?: string;
  serial?: string;
  owner?: string;
  by?: string;
  date_created?: string;
}

// User state interface
export interface CartItem {
  nxid: string;
  quantity?: number;
  location?: string;
  building?: number;
  serial?: string;
}

// Contains all part data
export interface LoadedCartItem {
  part: PartSchema;
  quantity?: number;
  serial?: string;
}

// User state for store
export interface UserState {
  isAuth: boolean;
  user: User;
  http: AxiosInstance;
  cart: Cart;
}

// User schema
export interface User {
  role?: string;
  date_created?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  building?: number;
  _v?: number;
  _id?: string;
}

export type AssetHistory = AssetEvent[];
export interface AssetEvent {
  date_begin: Date;
  date_end: Date;
  asset_id: string;
  by: string;
  asset_info?: AssetSchema;
  info_updated: boolean;
  existing: CartItem[];
  added: CartItem[];
  removed: CartItem[];
}

export interface PartCacheEntry {
  nxid: string;
  part: PartSchema;
}

export type PartCache = PartCacheEntry[];

export interface SNAvailable {
  serial: string;
  available: boolean;
}

export interface Cart {
  serialized: CartItem[];
  unserialized: Map<string, number>;
}
