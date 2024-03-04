import type { AxiosError, AxiosInstance } from 'axios';

// For db commands
export interface apiResponse {
  (data: object | Array<object> | string, err: AxiosError | null): void;
}

export interface loadPageCallback {
  (pageNum: number, startDate: Date, endDate: Date, userFilters?: string[], partFilters?: string[], hideOtherParts?: boolean, assetFilters?: string[]): Promise<AnalyticsSearchPage>;
}

export interface textSearchCallback {
  (building: number, pageNum: number, searchString: string) : Promise<TextSearchPage>
}

export interface advancedSearchCallback {
  (building: number, pageNum: number, searchObject: any) : Promise<TextSearchPage>
}

export interface AnalyticsSearchPage {
  total: number;
  pages: number;
  events: any[];
}

export interface TextSearchPage {
  total: number;
  pages: number;
  items: any[];
}

// For axios.ts
export interface AxiosOptions {
  baseUrl?: string;
  token?: string;
}

export enum PushTypes {
    Notification = "Notification",
    Payload = "Payload",
}

export interface Push {
    type: PushTypes
    payload: NotificationSchema | any
}

export enum NotificationTypes {
  Warning = "Warning",
  Error = "Error",
  Info = "Info",
  Alert = "Alert",
  Question = "Question",
}

export interface NotificationSchema {
  _id?: string;
  user?: string,
  type: NotificationTypes,
  text: string,
  date?: Date,
  date_read?: Date,
  title?: string,
  link?: string,
  quantity?: number;
  ms_left?: number;
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
  rack_num?: number;
  frequency?: number;
  chipset?: string;
  socket?: string|string[];
  size?: string;
  active?: boolean;
  memory_type?: string;
  memory_gen?: string;
  mem_rank?: string;
  peripheral_type?: string;
  mainboard_con?: string;
  storage_interface?: string;
  storage_type?: string;
  capacity?: number;
  capacity_unit?: string;
  num_ports?: number;
  port_type?: string|string[];
  cable_end1?: string;
  cable_end2?: string;
  serialized?: boolean;
  serials?: string[];
  consumable?: boolean;
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

  units?: number;
  num_psu?: number;
  psu_model?: string;
  parent?: string;
  cable_type?: string;
  num_bays?: number;
  bay_type?: string;
  pallet?: string;
  fw_rev?: string;
  old_by?: string;
  migrated?: boolean;

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
  pallet_tag?: string;
  serial?: string;
  owner?: string;
  ebay?: string;
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
  parts: Map<string, number>;
  notificationCount: number
}

// User schema
export interface User {
  roles?: string[];
  date_created?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  building?: number;
  enabled?: boolean;
  _v?: number;
  _id?: string;
  default?: boolean;
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

export interface InventoryEntry {
  nxid?: string,
  unserialized: number,
  serials: string[],
  newSerials?: string[]
}

export interface CheckInQueuePart extends CartItem {
  approved?: boolean,
  newLocation?: string
  approvedCount?: number
}

export interface CheckInRequest {
  date: Date,
  by: string,
  parts: CheckInQueuePart[]
}

export interface CheckInEventPart extends CartItem {
  approved: boolean
}

export interface CheckInEvent {
  date: Date,
  by: string,
  parts: CheckInEventPart[]
}

export interface CheckOutEvent extends CheckInRequest {
  location: string
}

export interface EbaySaleEvent extends CheckInRequest {
  order: string
}

export interface AssetPart extends LoadedCartItem {
  max_quantity?: number
}

export interface PalletSchema {
  [index: string]: any;
  _id: string,
  pallet_tag: string,
  location: string,
  building: number,
  by: string,
  date_created: Date,
  date_replaced: Date,
  notes: string,
  prev: string|null,
  next: string|null,
}

export interface PalletEvent {
  date_begin: Date,
  pallet_id: string,
  by: string,
  info_updated: boolean,
  existingParts: CartItem[],
  addedParts: CartItem[],
  removedParts: CartItem[],
  existingAssets: string[],
  addedAssets: string[],
  removedAssets: string[]
}


export type PalletHistory = PalletEvent[]

export interface AllTechsEvent {
  by: string,
  date: Date,
  existing: CartItem[],
  added: CartItem[],
  removed: CartItem[]
}

export type AllTechsHistory = AllTechsEvent[]

export interface PartEvent {
  date: Date,
  info: PartRecord,
  added: CartItem[],
  removed: CartItem[]
}

export interface PartRequestSchema {
  _id?: string,
  requested_by: string,
  parts: CartItem[],
  date_created: Date,
  date_fulfilled?: Date,
  fulfilled_by?: string,
  fulfilled_list?: {kiosk: string, parts: InventoryEntry[]}[]
  build_kit_id?: string,
  cancelled?: boolean,
  tech_notes?: string,
  clerk_notes?: string,
  denied?: boolean
}

export interface KioskQuantity {
  kiosk: string,
  quantity: number,
  max: number
}

export interface KioskQuantities {
  nxid: string,
  kiosk_quantities: KioskQuantity[],
  serials?: string[]
}

export interface BuildKitSchema {
  _id: string,
  kit_name: string,
  building: number,
  // parts on the request
  claimed_parts?: CartItem[],
  // Date the part request was created
  date_created: Date,
  date_claimed?: Date,
  created_by: string,
  requested_by?: string,
  claimed_by?: string,
  notes: string,
  parts?: CartItem[],
  kiosk: string
}
