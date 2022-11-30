import type { AxiosError, AxiosInstance } from "axios";

// For db commands
export interface apiResponse {
    (data: object | Array<object> | string, err: Error | AxiosError | null): void;
}

// For axios.ts
export interface AxiosOptions {
    baseUrl?: string
    token?: string
}

// For message component
export interface Message {
    text: string,
    quantity: number
}

// Database part schema
export interface PartSchema {
    _id?: string,
    nxid?: string,
    manufacturer?: string,
    name?: string,
    type?: string,
    location?: string,
    quantity?: number,
    frequency?: number,
    chipset?: string,
    memory_type?: string,
    peripheral_type?: string,
    storage_interface?: string,
    capacity?: number,
    capacity_unit?: string,
    num_ports?: number,
    port_type?: string,
    cable_end1?: string,
    cable_end2?: string,
}

export interface AssetSchema {
    _id?: string,
    building?: number,
    asset_type?: string,
    chassis_type?: string,
    manufacturer?: string,
    model?: string,
    serial?: string,
    rails?: boolean,
    live?: boolean,
    location?: string,
    by?: string,
    parts?: Array<string>,
    date_created?: Date
}

export interface PartRecord {
    _id?: string,
    nxid?: string,
    prev?: string,
    next?: string,
    building?: Number,
    location?: string,
    asset_tag?: string,
    owner?: string,
    by?: string,
    date_created?: Date
}

// User state interface
export interface CartItem {
    id: string,
    quantity: number
}

// Contains all part data
export interface LoadedCartItem {
    part: PartSchema,
    quantity: number
}

// User state for store
export interface UserState {
    isAuth: boolean,
    user: User,
    http: AxiosInstance
    cart: Array<CartItem>
}

// User schema
export interface User {
    admin?: boolean,
    date_created?: string,
    email?: string,
    first_name?: string,
    last_name?: string,
    _v?: number,
    _id?: string
}