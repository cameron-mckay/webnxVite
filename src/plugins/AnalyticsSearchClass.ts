import { User, PartSchema, AssetEvent, AssetSchema, CartItem, loadPageCallback, apiResponse, PalletSchema } from "./interfaces"
import { AxiosInstance } from "axios"
import { Router } from "vue-router"
import { getAllUsers } from "./dbCommands/userManager"
import { getPartByID } from "./dbCommands/partManager"
import { getAssetByID } from "./dbCommands/assetManager"
import { getLastMonth, getTodaysDate } from "./dateFunctions"
import { getPalletByID } from "./dbCommands/palletManager"

export default class AnalyticsSearch<Type> {
  // Vue shit
  private http: AxiosInstance;
  private router: Router
  // Search cached vars
  private numItems: number
  private numPages: number
  // Cache all users
  private allUsers: Map<string, User>
  // Cache loaded parts and assets
  public partsCache: Map<string, PartSchema>
  public assetCache: Map<string, AssetSchema>
  public palletCache: Map<string, PalletSchema>
  // Store filters from last search
  private lastUserFilters: string[]
  private lastPartFilters: string[]
  private lastHideOtherParts: boolean
  // Store dates from last search
  private lastStartDate: number
  private lastEndDate: number
  // Cache all loaded pages
  private pageCache: Map<number, Type[]>
  // Callback in case of cache miss
  private loadPageCallback: loadPageCallback

  // Analytics search factory
  static createAnalyticsSearch<Type>(http: AxiosInstance, router: Router, loadCallback: loadPageCallback):Promise<AnalyticsSearch<Type>> {
    // Needs promise to load user cache
    return new Promise<AnalyticsSearch<Type>>((res, rej)=>{
      // Get all users
      getAllUsers(http, async (data, err) => {
        if(err) {
          return rej()
        }
        // Temporary array
        let allUsers = data as User[]
        // Process all users
        let part_ids = router.currentRoute.value.query.parts ? (Array.isArray(router.currentRoute.value.query.parts) ? router.currentRoute.value.query.parts : [router.currentRoute.value.query.parts]) : []
        let partInfo = await Promise.all(part_ids.map((p)=>AnalyticsSearch.loadPart(http, p as string)))
        // Push check in queue to ref
        res(new AnalyticsSearch(http, allUsers, partInfo, router, loadCallback))
      })
    })
  }

  // Constructor for Analytics search - factory funtion should be used instead
  constructor(http: AxiosInstance, allUsers: User[], parts: PartSchema[], router: Router, loadCallback: loadPageCallback) {
    this.http = http;
    // Initialize dependencies
    this.router = router
    this.numPages = 0
    this.numItems = 0
    // Initialize caches
    this.allUsers = new Map<string, User>()
    this.partsCache = new Map<string, PartSchema>()
    this.assetCache = new Map<string, AssetSchema>()
    this.palletCache = new Map<string, PalletSchema>()
    this.pageCache = new Map<number, Type[]>()
    // Cache the last search params
    this.lastUserFilters = []
    this.lastPartFilters = []
    this.lastStartDate = -1
    this.lastEndDate = -1
    this.lastHideOtherParts = false
    // Add cached parts
    for (let part of parts) {
      this.partsCache.set(part.nxid!, part)
    }
    // Load all users
    for (let user of allUsers) {
      this.allUsers.set(user._id!, user)
    }
    // Register callback
    this.loadPageCallback = loadCallback
  }

  // Gets the part filters from the provided instance
  static getPartFiltersFromRouter(router: Router) {
    return router.currentRoute.value.query.parts ? (Array.isArray(router.currentRoute.value.query.parts) ? router.currentRoute.value.query.parts : [router.currentRoute.value.query.parts]) : []
  }

  // Gets the user filters from the provided instance
  static getUserFiltersFromRouter(router: Router) {
    return router.currentRoute.value.query.users ? (Array.isArray(router.currentRoute.value.query.users) ? router.currentRoute.value.query.users : [router.currentRoute.value.query.users]) : []
  }
  
  getPartFilterMapFromRouter() {
    return new Promise<Map<string, PartSchema>>(async (res)=>{
      // Get nxids from router
      let nxids = AnalyticsSearch.getPartFiltersFromRouter(this.router) as string[]
      // Get info array from this object, will use cache or save newly loaded parts to cache
      let infoArray = await this.getPartInfoArray(nxids)
      // Create a map
      let partFilterMap = new Map<string, PartSchema>()
      // Loop through loaded parts
      for (let p of infoArray) {
        // Add to map
        partFilterMap.set(p.nxid!, p)
      }
      // Resolve promse
      res(partFilterMap)
    })
  }

  getUserFilterMapFromRouter() {
    let userFilterArray = AnalyticsSearch.getUserFiltersFromRouter(this.router).map((u)=>this.getUser(u as string))
    let userFilterMap = new Map<string, User>()
    for(let u of userFilterArray) {
      userFilterMap.set((u as User)._id!, u!)
    }
    return userFilterMap
  }

  getAllUserMap() {
    return this.allUsers
  }

  getStartDateFromRouter() {
    return isNaN(parseInt(this.router.currentRoute.value.query.startDate as string))? getLastMonth() : new Date(parseInt(this.router.currentRoute.value.query.startDate as string))
  }

  getEndDateFromRouter() {
    return isNaN(parseInt(this.router.currentRoute.value.query.endDate as string))? getTodaysDate() : new Date(parseInt(this.router.currentRoute.value.query.endDate as string))
  }

  getHideOthersFromRouter() {
    return (this.router.currentRoute.value.query.hideOtherParts as string) == "true" ? true : false
  }

  getAllUsers() {
    return Array.from(this.allUsers.values())
  }

  getHttp() {
    return this.http
  }

  getPageNumFromRouter() {
    return isNaN(parseInt(this.router.currentRoute.value.query.pageNum as string)) ? 1 : parseInt(this.router.currentRoute.value.query.pageNum as string)
  }

  static loadPart(http: AxiosInstance, part: string|CartItem) {
    return new Promise<PartSchema>((res)=>{
      let nxid = ""
      if(typeof(part)=="string") {
        nxid = part
      }
      else {
        nxid = part.nxid
      }
      getPartByID(http, nxid, 3, (data, err)=>{
        if (err) {
          res({})
          return;
        }
        // Set new value
        res(data as PartSchema)
      });
    })
  }

  static loadAsset(http: AxiosInstance, asset: string|AssetSchema) {
    return new Promise<AssetSchema>((res)=>{
      let asset_tag = ""
      if(typeof(asset)=="string") {
        asset_tag = asset
      }
      else {
        asset_tag = asset.asset_tag!
      }
      getAssetByID(http, asset_tag, (data, err)=>{
        if(err) {
          res({})
          return
        }
        res(data as AssetSchema)
      })
    })
  }

  static loadPallet(http: AxiosInstance, pallet: string|PalletSchema) {
    return new Promise<PalletSchema>((res)=>{
      let pallet_tag = ""
      if(typeof(pallet)=="string") {
        pallet_tag = pallet
      }
      else {
        pallet_tag = pallet.pallet_tag!
      }
      getPalletByID(http, pallet_tag, (data, err)=>{
        if(err) {
          res({} as PalletSchema)
          return
        }
        res(data as PalletSchema)
      })
    })
  }

  getAsset(asset: string|AssetSchema) {
    return new Promise<AssetSchema>(async (res)=>{
      let asset_tag = ""
      if(typeof(asset)=="string") {
        asset_tag = asset
      }
      else {
        asset_tag = asset.asset_tag!
      }
      if(this.assetCache.has(asset_tag))
        return res(this.assetCache.get(asset_tag)!)
      // Set temp value
      this.assetCache.set(asset_tag, {});
      // Fetch asset from API
      let p = await AnalyticsSearch.loadAsset(this.http, asset_tag)
      this.assetCache.set(asset_tag, p);
      // Check if asset loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          this.assetCache.delete(asset_tag);
      res(p)
    })
  }

  getPallet(pallet: string|PalletSchema) {
    return new Promise<PalletSchema>(async (res)=>{
      let pallet_tag = ""
      if(typeof(pallet)=="string") {
        pallet_tag = pallet
      }
      else {
        pallet_tag = pallet.pallet_tag!
      }
      if(this.palletCache.has(pallet_tag))
        return res(this.palletCache.get(pallet_tag)!)
      // Set temp value
      this.palletCache.set(pallet_tag, {} as PalletSchema);
      // Fetch pallet from API
      let p = await AnalyticsSearch.loadPallet(this.http, pallet_tag)
      this.palletCache.set(pallet_tag, p);
      // Check if pallet loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          this.palletCache.delete(pallet_tag);
      res(p)
    })
  }
  
  static getPartInfoArray(http: AxiosInstance, parts: CartItem[]|string[]) {
    return Promise.all(parts.map((p)=>AnalyticsSearch.loadPart(http, p)))
  }
  
  getPartInfoArray(parts: CartItem[]|string[]) {
    return Promise.all(parts.map((p)=>this.getPartInfo(p)))
  }

  getPartInfo(part: CartItem|string) {
    return new Promise<PartSchema>(async (res)=>{
      let nxid = ""
      if(typeof(part)=="string") {
        nxid = part
      }
      else {
        nxid = part.nxid
      }
      // Check if part is already mapped
      if (this.partsCache.has(nxid))
        return res(this.partsCache.get(nxid)!)
      // Set temp value
      this.partsCache.set(nxid, {});
      // Fetch part from API
      let p = await AnalyticsSearch.loadPart(this.http, nxid)
      this.partsCache.set(nxid, p);
      // Check if part loaded properly
      if(JSON.stringify(p)==JSON.stringify({}))
          this.partsCache.delete(nxid);
      res(p)
    })
  }

  getUser(id: string) {
    // Return user if they exist
    return this.allUsers.has(id) ? this.allUsers.get(id) : {
      email: "NOT FOUND",
      first_name: "NOT FOUND",
      last_name: "NOT FOUND",
      enabled: false,
      building: 0,
      data_created: "NEVER",
      roles: []
    }
  }

  getNumItems() {
    return this.numItems
  }

  getNumPages() {
    return this.numPages ? this.numPages : 1
  }

  cachePage(pageNum: number, events: Type[]) {
    this.pageCache.set(pageNum, events)
  }

  // Cache 5 pages ahead and behind
  loadCache(pageNum: number) {
    let page = pageNum
    while (page > 0 && page >= pageNum - 5) {
      let localPage = page;
      // Check if exists in cache
      if (this.pageCache.has(localPage)) {
        // Decrement and continue
        page -= 1;
        continue;
      } else {
        // Set temp value
        this.pageCache.set(localPage, []);
        // Get Page from api
        // Update local info
        this.loadPageCallback(localPage, new Date(this.lastStartDate), new Date(this.lastEndDate), this.lastUserFilters, this.lastPartFilters, this.lastHideOtherParts)
          .then((page) => {
            console.log(page)
            // Set new value
            this.numPages = page.pages
            this.numItems = page.total
            this.pageCache.set(localPage, page.events)
          })
          .catch(() => {
            // Delete temp value
            this.pageCache.delete(localPage);
          });
        // Decrement
        page -= 1;
      }
    }
    page = pageNum;
    // Get next 5 pages
    while (page <= pageNum + 5) {
      let localPage = page;
      // Check if cache has page
      if (this.pageCache.has(localPage)) {
        // increment and continue
        page++;
        continue;
      } else {
        // Set temp value
        this.pageCache.set(localPage, []);
        // Get page from api
        this.loadPageCallback(localPage, new Date(this.lastStartDate), new Date(this.lastEndDate), this.lastUserFilters, this.lastPartFilters, this.lastHideOtherParts)
          .then((page) => {
            console.log(page)
            // Set new value
            this.numPages = page.pages
            this.numItems = page.total
            this.pageCache.set(localPage, page.events)
          })
          .catch(() => {
            // Delete temp value
            this.pageCache.delete(localPage);
          });
        // Increment
        page++;
      }
    }
  }

  hasPage(pageNum: number, startDate: Date, endDate: Date, userFilters?: string[], partFilters?: string[], hideOtherParts?: boolean) {
      if(
        startDate.getTime()!=this.lastStartDate||
        endDate.getTime()!=this.lastEndDate ||
        (userFilters?JSON.stringify(userFilters):JSON.stringify([]))!=JSON.stringify(this.lastUserFilters) ||
        (partFilters?JSON.stringify(partFilters):JSON.stringify([]))!=JSON.stringify(this.lastPartFilters) ||
        hideOtherParts != this.lastHideOtherParts
      ) {
        return false
      }
      return this.pageCache.has(pageNum)
  }

  async loadPage(pageNum: number, startDate: Date, endDate: Date, userFilters?: string[], partFilters?: string[], hideOtherParts?: boolean) {
    return new Promise<Type[]>(async (res)=>{
      let searchParamChanged = false
      // Check for change in search params
      if(
        startDate.getTime()!=this.lastStartDate||
        endDate.getTime()!=this.lastEndDate ||
        (userFilters?JSON.stringify(userFilters):JSON.stringify([]))!=JSON.stringify(this.lastUserFilters) ||
        (partFilters?JSON.stringify(partFilters):JSON.stringify([]))!=JSON.stringify(this.lastPartFilters) ||
        hideOtherParts != this.lastHideOtherParts
      ) {
        // Clear the page cache
        this.pageCache.clear()
        // Set flag
        searchParamChanged = true
      }
      // Store the new search params
      this.lastStartDate = startDate.getTime()
      this.lastEndDate = endDate.getTime()
      this.lastUserFilters = userFilters ? JSON.parse(JSON.stringify(userFilters)) : []
      this.lastPartFilters = partFilters ? JSON.parse(JSON.stringify(partFilters)) : []
      this.lastHideOtherParts = hideOtherParts == true ? true : false
      // Local variable for fetching page
      let thisPage = [] as Type[]
      // Update the router
      this.router.replace({
        query: {
          pageNum: pageNum,
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
          users: userFilters,
          parts: partFilters,
          hideOtherParts: this.lastHideOtherParts ? "true" : "false"
        }
      });
      // Early return if the request doesn't make sense
      if((pageNum < 1) || ((pageNum > this.numPages)&&!searchParamChanged)) {
        return res(thisPage)
      }
      // If the cache doesn't have the page
      if(!this.pageCache.has(pageNum)) {
        // Load page from callback
        let page = await this.loadPageCallback(pageNum, startDate, endDate, this.lastUserFilters, this.lastPartFilters, this.lastHideOtherParts)
        // Update local info
        this.numPages = page.pages
        this.numItems = page.total
        this.pageCache.set(pageNum, page.events)
      }
      // Load from cache
      thisPage = this.pageCache.get(pageNum)!
      // Return the page
      this.loadCache(pageNum)
      res(thisPage)
    })
  }
}
