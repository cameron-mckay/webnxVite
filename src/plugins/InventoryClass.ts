import { AxiosInstance } from "axios";
import Cacher from "./Cacher";
import { AssetSchema, BoxSchema, CartItem, LoadedCartItem, PartSchema, User } from "./interfaces";
import { getUserInventoryByID } from "./dbCommands/userManager";
import { getPartsOnAsset } from "./dbCommands/assetManager";
import { getPartsOnPallet } from "./dbCommands/palletManager";
import { getPartsOnBox } from "./dbCommands/boxManager";

export default class Inventory {
  maxQuantites: Map<string, number>
  thisUser: User
  sourceList: LoadedCartItem[]
  destList: LoadedCartItem[]
  extraDestUsers: User[]
  extraSourceUsers: User[]
  refreshComponentsCallback: () => void
  correction: boolean
  moving: boolean

  constructor(thisUser: User, extraSourceUsers?: User[], extraDestUsers?: User[]) {
    // Initialize all the class variables
    this.maxQuantites = new Map<string, number>();
    this.sourceList = [];
    this.destList = [];
    this.thisUser = thisUser;
    this.extraDestUsers = extraDestUsers ? extraDestUsers : [];
    this.extraSourceUsers = extraSourceUsers ? extraSourceUsers : [];
    this.correction = false;
    this.moving = false;
    this.refreshComponentsCallback = ()=>{ console.log("unregistered callback") }
  }

  static getUserInventoryByID(http: AxiosInstance, user_id: string) {
    return new Promise<CartItem[]>((res)=>{
      getUserInventoryByID(http, user_id, (data, err) => {
        if (err) {
            res([])
        }
        res(data as CartItem[])
      });
    })
  }

  static getPartsOnAsset(http: AxiosInstance, asset_tag: string) {
    return new Promise<CartItem[]>((res)=>{
      getPartsOnAsset(http, asset_tag, (data, err)=>{
        if (err) {
            res([])
        }
        res(data as CartItem[])
      })
    })
  }

  static getPartsOnPallet(http: AxiosInstance, pallet_tag: string) {
    return new Promise<CartItem[]>((res)=>{
      getPartsOnPallet(http, pallet_tag, (data, err)=>{
        if (err) {
            res([])
        }
        res((data as any).parts! as CartItem[])
      })
    })
  }

  static getPartsOnBox(http: AxiosInstance, box_tag: string) {
    return new Promise<CartItem[]>((res)=>{
      getPartsOnBox(http, box_tag, (data,err)=>{
        if (err) {
            res([])
        }
        res(data as CartItem[])
      })
    })
  }

  static getItemsOnPallet(http: AxiosInstance, pallet_tag: string) {
    return new Promise<{parts: CartItem[], assets: AssetSchema[], boxes: BoxSchema[]}>((res)=>{
      getPartsOnPallet(http, pallet_tag, (data, err)=>{
        if (err) {
            res({parts: [], assets: [], boxes: []})
        }
        res(data as {parts: CartItem[], assets: AssetSchema[], boxes: BoxSchema[]})
      })
    })
  }

  getItemsOnPallet(pallet_tag: string) {
    return Inventory.getItemsOnPallet(Cacher.getHttp(), pallet_tag)
  }

  loadSourceInv(id: string) {
    return new Promise<LoadedCartItem[]>(async (res, rej)=>{
      try {
        let unloaded = await Inventory.getUserInventoryByID(Cacher.getHttp(), id)
        //
        this.sourceList = await Cacher.loadCartItems(unloaded)
        // Clear the existing max quantities
        this.maxQuantites.clear()
        // Loop through all parts
        for(let p of unloaded) {
          if(!p.quantity)
            continue
          // If a max quantity exists
          if(this.maxQuantites.has(p.nxid)) {
            // Add this quantity to the max
            this.maxQuantites.set(p.nxid, this.maxQuantites.get(p.nxid)! + p.quantity)
          } else {
            // Set the initial max quantity
            this.maxQuantites.set(p.nxid, p.quantity)
          }
        }
        // Clear the dest inventory
        this.clearDestInv()
        // Return the loaded cart items
        res(this.sourceList)
        this.refreshComponentsCallback()
      }
      catch {
        rej()
      }
    })
  }

  getMaxQuantity(nxid: string) {
    if(this.maxQuantites.has(nxid))
      return this.maxQuantites.get(nxid)
    return undefined
  }

  loadDestFromAsset(asset_tag: string) {
    return new Promise<void>(async (res, rej)=>{
      try {
        let assetParts = await Inventory.getPartsOnAsset(Cacher.getHttp(), asset_tag)
        for (let p of assetParts) {
          if(!p.quantity)
            continue
          // If a max quantity exists
          if(this.maxQuantites.has(p.nxid)) {
            // Add this quantity to the max
            this.maxQuantites.set(p.nxid, this.maxQuantites.get(p.nxid)! + p.quantity)
          } else {
            // Set the initial max quantity
            this.maxQuantites.set(p.nxid, p.quantity)
          }
        }
        this.destList = await Cacher.loadCartItems(assetParts)
        res()
        this.refreshComponentsCallback()
      }
      catch {
        rej()
      }
    })
  }

  loadDestFromPallet(pallet_tag: string) {
    return new Promise<void>(async (res, rej)=>{
      try {
        let palletParts = await Inventory.getPartsOnPallet(Cacher.getHttp(), pallet_tag)
        for (let p of palletParts) {
          if(!p.quantity)
            continue
          // If a max quantity exists
          if(this.maxQuantites.has(p.nxid)) {
            // Add this quantity to the max
            this.maxQuantites.set(p.nxid, this.maxQuantites.get(p.nxid)! + p.quantity)
          } else {
            // Set the initial max quantity
            this.maxQuantites.set(p.nxid, p.quantity)
          }
        }
        this.destList = await Cacher.loadCartItems(palletParts)
        res()
        this.refreshComponentsCallback()
      }
      catch {
        rej()
      }
    })
  }

  loadDestFromBox(box_tag: string) {
    return new Promise<void>(async (res, rej)=>{
      try {
        let boxParts = await Inventory.getPartsOnBox(Cacher.getHttp(), box_tag)
        for (let p of boxParts) {
          if(!p.quantity)
            continue
          // If a max quantity exists
          if(this.maxQuantites.has(p.nxid)) {
            // Add this quantity to the max
            this.maxQuantites.set(p.nxid, this.maxQuantites.get(p.nxid)! + p.quantity)
          } else {
            // Set the initial max quantity
            this.maxQuantites.set(p.nxid, p.quantity)
          }
        }
        this.destList = await Cacher.loadCartItems(boxParts)
        res()
        this.refreshComponentsCallback()
      }
      catch {
        rej()
      }
    })
  }

  setDestInventory(cartItems: CartItem[]) {
    return new Promise<void>(async (res, rej)=>{
      try {
        for (let p of cartItems) {
          if(!p.quantity)
            continue
          // If a max quantity exists
          if(this.maxQuantites.has(p.nxid)) {
            // Add this quantity to the max
            this.maxQuantites.set(p.nxid, this.maxQuantites.get(p.nxid)! + p.quantity)
          } else {
            // Set the initial max quantity
            this.maxQuantites.set(p.nxid, p.quantity)
          }
        }
        this.destList = await Cacher.loadCartItems(cartItems)
        res()
        this.refreshComponentsCallback()
      }
      catch {
        rej()
      }
    })
  }

  getSourceUsers() {
    // Get the extra dest users
    let returnVal = [] as User[]
    // If admin, add admin only dests
    if(this.thisUser.roles?.includes('manage_others_inventory')||this.thisUser.roles?.includes('is_kiosk')) {
      // Add the users without sales or kiosk roles
      returnVal = returnVal.concat(JSON.parse(JSON.stringify(Cacher.getAllUsers().filter((u)=>u.roles?.includes("own_parts")))))
    }
    else {
      returnVal.push(Cacher.getCurrentUser())
    }
    returnVal = returnVal.concat(JSON.parse(JSON.stringify(this.extraSourceUsers)) as User[])
    return returnVal
  }

  getDestUsers() {
    // Get the extra dest users
    let returnVal = [] as User[]
    // If admin, add admin only dests
    if(this.thisUser.roles?.includes('manage_others_inventory')) {
      // Add the users without sales or kiosk roles
      returnVal = returnVal.concat(JSON.parse(JSON.stringify(Cacher.getAllUsers().filter((u)=>u.roles?.includes('own_parts')))))
    }
    else {
      returnVal.push(Cacher.getCurrentUser())
    }
    returnVal = returnVal.concat(JSON.parse(JSON.stringify(this.extraDestUsers)) as User[])
    return returnVal
  }

  clearDestInv() {
    this.destList = []
    this.refreshComponentsCallback()
  }

  getSourceInv() {
    return this.sourceList
  }

  getDestInv() {
    return this.destList
  }

  moveToDestList(
    part: PartSchema,
    difference: number,
    serial?: string,
  ) {
    if(this.moving)
      return
    this.moving = true
    // Allow positive or negative difference
    if(difference<0) {
      if(this.correction) {
        this.correctionAdd(part, difference*-1)
      }
      else
        this.move(this.sourceList, this.destList, part, difference*-1, serial);
    }
    if(difference>0)
      this.moveBack(this.destList, this.sourceList, part, difference, serial);
    this.moving = false
  }

  moveToSourceList(
    part: PartSchema,
    difference: number,
    serial?: string,
  ) {
    if(this.moving)
      return
    this.moving = true
    // Allow positive or negative difference
    if(difference<0)
      this.moveBack(this.destList, this.sourceList, part, difference*-1, serial);
    if(difference>0) {
      if(this.correction) {
        this.correctionAdd(part, difference)
      }
      else
        this.move(this.sourceList, this.destList, part, difference, serial);
    }
    this.moving = false
  }

  protected move(
    array1: LoadedCartItem[],
    array2: LoadedCartItem[],
    part: PartSchema,
    quantity: number,
    serial?: string
  ) {
    // Create var for item to move
    let item1 = {} as LoadedCartItem | undefined;
    // If item is serialized
    if (serial != undefined) {
      // Find existing item
      item1 = array1.find((e) => e.serial == serial && e.part.nxid == part.nxid);
      // Return if not found
      if (!item1) {
        this.refreshComponentsCallback()
        return;
      }
      // Remove from array 1
      array1.splice(array1.indexOf(item1), 1);
      // Push to array 2
      array2.push({ part, serial: serial });
    } else {
      // Find matching part in array 1
      item1 = array1.find((e) => e.part.nxid == part.nxid && e.serial == undefined);
      // Return if not found
      if (!item1 || !quantity) {
        this.refreshComponentsCallback()
        return;
      }
      // subtract quantity
      item1.quantity! -= quantity;
      // Remove from array if quantity < 1
      if (item1.quantity! < 1)
        array1.splice(array1.indexOf(item1), 1);
      // Find in array 2
      let item2 = array2.find((e) => ((e.part.nxid == part.nxid) && (e.serial == undefined)));
      // If it doesn't exist, push a new entry
      if (!item2) array2.push({ part, quantity });
      // Otherwise increment existing entry
      else item2.quantity! += quantity;
    }
    this.refreshComponentsCallback()
  }

  protected moveBack(
    array1: LoadedCartItem[],
    array2: LoadedCartItem[],
    part: PartSchema,
    quantity: number,
    serial?: string
  ) {
    this.move(array1, array2, part, quantity, serial)
  }

  setCorrection(val: boolean) {
    this.correction = val
  }

  correctionAdd(part: PartSchema, difference: number) {
    // if(part.serialized) {
    //   this.destList.push({ part, serial: ""})
    // }
    // else {
      let item2 = this.destList.find((e) => e.part.nxid == part.nxid);
      // If it doesn't exist, push a new entry
      if (!item2) this.destList.push({ part, quantity: 1 });
      // Otherwise increment existing entry
      else item2.quantity! += difference;
    // }
    this.refreshComponentsCallback()
  }
  registerRefreshCallback(newCallback: ()=>void) {
    this.refreshComponentsCallback = newCallback
  }

  refreshComponents() {
    this.refreshComponentsCallback()
  }

  async reload() {
    this.refreshComponentsCallback()
  }
}
