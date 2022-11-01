import type { AxiosError, AxiosInstance } from "axios";

// For db commands
export interface apiResponse {
    (data: object | Array<object>, err: Error | AxiosError | null): void;
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