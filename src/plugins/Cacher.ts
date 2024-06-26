import { AxiosError, AxiosInstance } from "axios";
import { Router } from "vue-router";
import { AssetSchema, BoxSchema, CartItem, LoadedCartItem, PalletSchema, PartSchema, User, UserState } from "./interfaces";
import { getAllUsers } from "./dbCommands/userManager";
import { getPartByID } from "./dbCommands/partManager";
import { getPalletByID } from "./dbCommands/palletManager";
import { getAssetByID } from "./dbCommands/assetManager";
import { Store } from "vuex";
import { getBoxByID } from "./dbCommands/boxManager";
import { DEFAULT_BUILDING } from "./Constants";

export default class Cacher {
  private static http: AxiosInstance;
  private static router: Router;
  private static store: Store<UserState>;
  // Cache all users
  private static allUsers = new Map<string, User>()
  // Cache loaded parts and assets
  private static partsCache = new Map<string, PartSchema>()
  private static assetCache = new Map<string, AssetSchema>()
  private static palletCache = new Map<string, PalletSchema>()
  private static boxCache = new Map<string, BoxSchema>()
  static errorHandler = (err: AxiosError | string) => {}
  static messageHandler = (msg: string) => {}

  static loadAllUsersFromAPI() {
    getAllUsers(Cacher.http, async (data, err) => {
      if(err) {
        Cacher.errorHandler(err)
        return
      }
      for(let u of data as User[]) {
        Cacher.allUsers.set(u._id!, u)
      }
    })
  }

  static loadAllUsersFromAPISync() {
    return new Promise<User[]>((res)=>{
      getAllUsers(Cacher.http, async (data, err) => {
        if(err) {
          Cacher.errorHandler(err)
          return
        }
        for(let u of data as User[]) {
          Cacher.allUsers.set(u._id!, u)
        }
        res(data as User[])
      })
    })
  }

  static validateCache() {
    // Cache checks need to be implemented on backend
    // Just clear out cache for now
    Cacher.partsCache.clear()
    Cacher.assetCache.clear()
    Cacher.palletCache.clear()
  }

  static assignAxios(http: AxiosInstance) {
    Cacher.http = http
  }

  static assignRouter(router: Router) {
    Cacher.router = router
  }
  
  static assignStore(store: Store<UserState>) {
    Cacher.store = store
  }

  static assignErrorHandler(errorHandler: (err: AxiosError | string)=>void) {
    Cacher.errorHandler = errorHandler
  }

  static assignMessageHandler(messageHandler: (msg: string)=>void) {
    Cacher.messageHandler = messageHandler
  }

  static getPartCache() {
    return Cacher.partsCache
  }

  static getAssetCache() {
    return Cacher.assetCache
  }

  static getPalletCache() {
    return Cacher.palletCache
  }

  static getBoxCache() {
    return Cacher.boxCache
  }

  static getKiosks() {
    return Array.from(this.allUsers.values()).filter((u)=>u.roles?.includes('is_kiosk'))
  }

  static getAsset(asset: string|AssetSchema) {
    return new Promise<AssetSchema>(async (res)=>{
      let asset_tag = ""
      if(typeof(asset)=="string") {
        asset_tag = asset
      }
      else {
        asset_tag = asset.asset_tag!
      }
      if(Cacher.assetCache.has(asset_tag))
        return res(Cacher.assetCache.get(asset_tag)!)
      // Set temp value
      Cacher.assetCache.set(asset_tag, {});
      // Fetch asset from API
      let p = await Cacher.loadAssetFromAPI(asset_tag)
      Cacher.assetCache.set(asset_tag, p);
      // Check if asset loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          Cacher.assetCache.delete(asset_tag);
      res(p)
    })
  }

  static getPallet(pallet: string|PalletSchema) {
    return new Promise<PalletSchema>(async (res)=>{
      let pallet_tag = ""
      if(typeof(pallet)=="string") {
        pallet_tag = pallet
      }
      else {
        pallet_tag = pallet.pallet_tag!
      }
      if(Cacher.palletCache.has(pallet_tag))
        return res(Cacher.palletCache.get(pallet_tag)!)
      // Set temp value
      Cacher.palletCache.set(pallet_tag, {} as PalletSchema);
      // Fetch pallet from API
      let p = await Cacher.loadPalletFromAPI(pallet_tag)
      Cacher.palletCache.set(pallet_tag, p);
      // Check if pallet loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          Cacher.palletCache.delete(pallet_tag);
      res(p)
    })
  }

  static getBox(box: string|BoxSchema) {
    return new Promise<BoxSchema>(async (res)=>{
      let box_tag = ""
      if(typeof(box)=="string") {
        box_tag = box
      }
      else {
        box_tag = box.box_tag!
      }
      if(Cacher.boxCache.has(box_tag))
        return res(Cacher.boxCache.get(box_tag)!)
      // Set temp value
      Cacher.boxCache.set(box_tag, {} as BoxSchema);
      // Fetch box from API
      let p = await Cacher.loadBoxFromAPI(box_tag)
      Cacher.boxCache.set(box_tag, p);
      // Check if box loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          Cacher.boxCache.delete(box_tag);
      res(p)
    })
  }

  static getPartInfoArray(parts: CartItem[]|string[]) {
    return Promise.all(parts.map((p)=>Cacher.getPartInfo(p)))
  }

  static getPartInfo(part: CartItem|string) {
    return new Promise<PartSchema>(async (res)=>{
      let nxid = ""
      if(typeof(part)=="string") {
        nxid = part
      }
      else {
        nxid = part.nxid
      }
      // Check if part is already mapped
      if (Cacher.partsCache.has(nxid))
        return res(Cacher.partsCache.get(nxid)!)
      // Fetch part from API
      let p = await Cacher.loadPartFromAPI(nxid)
      Cacher.partsCache.set(nxid, p);
      // Check if part loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          Cacher.partsCache.delete(nxid);
      res(p)
    })
  }
  static getPartInfoKiosk(part: CartItem|string, kiosk: User) {
    return new Promise<PartSchema>(async (res)=>{
      let nxid = ""
      if(typeof(part)=="string") {
        nxid = part
      }
      else {
        nxid = part.nxid
      }
      // Check if part is already mapped
      if (Cacher.partsCache.has(nxid))
        return res(Cacher.partsCache.get(nxid)!)
      // Set temp value
      Cacher.partsCache.set(nxid, {});
      // Fetch part from API
      let p = await Cacher.loadPartFromAPI(nxid, kiosk)
      Cacher.partsCache.set(nxid, p);
      // Check if part loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          Cacher.partsCache.delete(nxid);
      res(p)
    })
  }

  static getCurrentUser() {
    return Cacher.getUser(Cacher.store.state.user._id!)
  }

  static getUser(id: string) {
    // Return user if they exist
    return Cacher.allUsers.has(id) ? Cacher.allUsers.get(id)! : {} as User
  }

  static getAllUserMap() {
    return Cacher.allUsers
  }

  static getAllUsers() {
    return Array.from(Cacher.allUsers.values())
  }

  static getHttp() {
    return Cacher.http
  }

  static getRouter() {
    return Cacher.router
  }

  private static loadPartFromAPI(part: string|CartItem, kiosk?: User) {
    return new Promise<PartSchema>((res)=>{
      let nxid = ""
      if(typeof(part)=="string") {
        nxid = part
      }
      else {
        nxid = part.nxid
      }
      getPartByID(Cacher.http, nxid, DEFAULT_BUILDING, (data, err)=>{
        if (err) {
          Cacher.errorHandler(err)
          res({})
          return;
        }
        // Set new value
        res(data as PartSchema)
      }, kiosk ? kiosk.first_name + " " + kiosk.last_name  : undefined);
    })
  }

  private static loadAssetFromAPI(asset: string|AssetSchema) {
    return new Promise<AssetSchema>((res)=>{
      let asset_tag = ""
      if(typeof(asset)=="string") {
        asset_tag = asset
      }
      else {
        asset_tag = asset.asset_tag!
      }
      getAssetByID(Cacher.http, asset_tag, (data, err)=>{
        if(err) {
          Cacher.errorHandler(err)
          res({})
          return
        }
        res(data as AssetSchema)
      })
    })
  }

  private static loadPalletFromAPI(pallet: string|PalletSchema) {
    return new Promise<PalletSchema>((res)=>{
      let pallet_tag = ""
      if(typeof(pallet)=="string") {
        pallet_tag = pallet
      }
      else {
        pallet_tag = pallet.pallet_tag!
      }
      getPalletByID(Cacher.http, pallet_tag, (data, err)=>{
        if(err) {
          Cacher.errorHandler(err)
          res({} as PalletSchema)
          return
        }
        res(data as PalletSchema)
      })
    })
  }

  private static loadBoxFromAPI(box: string|BoxSchema) {
    return new Promise<BoxSchema>((res)=>{
      let box_tag = ""
      if(typeof(box)=="string") {
        box_tag = box
      }
      else {
        box_tag = box.box_tag!
      }
      getBoxByID(Cacher.http, box_tag, (data, err)=>{
        if(err) {
          Cacher.errorHandler(err)
          res({} as BoxSchema)
          return
        }
        res(data as BoxSchema)
      })
    })
  }

  static unloadParts(parts: LoadedCartItem[]) {
    return parts.map((p)=>{
      if(p.serial)
        return{nxid: p.part.nxid, serial: p.serial }as CartItem
      return{nxid: p.part.nxid, quantity: p.quantity }as CartItem
    })
  }

  static async loadCartItem(item: CartItem) {
  return new Promise<LoadedCartItem>(async (res)=>{
    let info = await Cacher.getPartInfo(item)
    res({ part: info, quantity: item.quantity, serial: item.serial } as LoadedCartItem)
  })
}

  static async loadCartItems(items: CartItem[]) {
    let nxids = items.map((v)=>v.nxid).filter((v,i,arr)=>arr.indexOf(v)==i)
    await this.getPartInfoArray(nxids)
    return Promise.all(items.map((p)=>{
      return this.loadCartItem(p)
    }))
  }
}
