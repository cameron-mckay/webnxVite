import { Router } from "vue-router"
import { User, PartSchema, loadPageCallback, AssetSchema, BoxSchema, PalletSchema } from "./interfaces"
import { getLastMonth, getTodaysDate } from "./dateFunctions"
import Cacher from "./Cacher"

export default class AnalyticsSearch<Type> {
  // Vue shit
  private router: Router
  // Search cached vars
  private numItems: number
  private numPages: number
  // Store filters from last search
  private lastUserFilters: string[]
  private lastPartFilters: string[]
  private lastAssetFilters: string[]
  private lastPalletFilters: string[]
  private lastBoxFilters: string[]
  private lastHideOtherParts: boolean
  // Store dates from last search
  private lastStartDate: number
  private lastEndDate: number
  // Cache all loaded pages
  private pageCache: Map<number, Type[]>
  // Callback in case of cache miss
  private loadPageCallback: loadPageCallback
  // Constructor for Analytics search - factory funtion should be used instead
  constructor(loadCallback: loadPageCallback) {
    // Initialize dependencies
    this.router = Cacher.getRouter()
    this.numPages = 0
    this.numItems = 0
    // Initialize caches
    this.pageCache = new Map<number, Type[]>()
    // Cache the last search params
    this.lastUserFilters = []
    this.lastPartFilters = []
    this.lastAssetFilters = []
    this.lastPalletFilters = []
    this.lastBoxFilters = []
    this.lastStartDate = -1
    this.lastEndDate = -1
    this.lastHideOtherParts = false
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
  
  static getAssetFiltersFromRouter(router: Router) {
    return router.currentRoute.value.query.assets ? (Array.isArray(router.currentRoute.value.query.assets) ? router.currentRoute.value.query.assets : [router.currentRoute.value.query.assets]) : []
  }
  static getPalletFiltersFromRouter(router: Router) {
    return router.currentRoute.value.query.pallets ? (Array.isArray(router.currentRoute.value.query.pallets) ? router.currentRoute.value.query.pallets : [router.currentRoute.value.query.pallets]) : []
  }
  static getBoxFiltersFromRouter(router: Router) {
    return router.currentRoute.value.query.boxes ? (Array.isArray(router.currentRoute.value.query.boxes) ? router.currentRoute.value.query.boxes : [router.currentRoute.value.query.boxes]) : []
  }
  getPartFilterMapFromRouter() {
    return new Promise<Map<string, PartSchema>>(async (res)=>{
      // Get nxids from router
      let nxids = AnalyticsSearch.getPartFiltersFromRouter(this.router) as string[]
      // Get info array from this object, will use cache or save newly loaded parts to cache
      let infoArray = await Cacher.getPartInfoArray(nxids)
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

  getAssetFilterMapFromRouter() {
    return new Promise<Map<string, AssetSchema>>(async (res)=>{
      // Get nxids from router
      let asset_tags = AnalyticsSearch.getAssetFiltersFromRouter(this.router) as string[]
      // Get info array from this object, will use cache or save newly loaded parts to cache
      let infoArray = await Promise.all(asset_tags.map((a)=>Cacher.getAsset(a)))
      // Create a map
      let assetFilterMap = new Map<string, AssetSchema>()
      // Loop through loaded parts
      for (let p of infoArray) {
        // Add to map
        assetFilterMap.set(p.asset_tag!, p)
      }
      // Resolve promse
      res(assetFilterMap)
    })
  }

  getPalletFilterMapFromRouter() {
    return new Promise<Map<string, PalletSchema>>(async (res)=>{
      // Get nxids from router
      let pallet_tags = AnalyticsSearch.getPalletFiltersFromRouter(this.router) as string[]
      // Get info array from this object, will use cache or save newly loaded parts to cache
      let infoArray = await Promise.all(pallet_tags.map((p)=>Cacher.getPallet(p)))
      // Create a map
      let palletFilterMap = new Map<string, PalletSchema>()
      // Loop through loaded parts
      for (let p of infoArray) {
        // Add to map
        palletFilterMap.set(p.pallet_tag!, p)
      }
      // Resolve promse
      res(palletFilterMap)
    })
  }

  getBoxFilterMapFromRouter() {
    return new Promise<Map<string, BoxSchema>>(async (res)=>{
      // Get nxids from router
      let box_tags = AnalyticsSearch.getBoxFiltersFromRouter(this.router) as string[]
      // Get info array from this object, will use cache or save newly loaded parts to cache
      let infoArray = await Promise.all(box_tags.map((b)=>Cacher.getBox(b)))
      // Create a map
      let boxFilterMap = new Map<string, BoxSchema>()
      // Loop through loaded parts
      for (let p of infoArray) {
        // Add to map
        boxFilterMap.set(p.box_tag!, p)
      }
      // Resolve promse
      res(boxFilterMap)
    })
  }

  getUserFilterMapFromRouter() {
    let userFilterArray = AnalyticsSearch.getUserFiltersFromRouter(this.router).map((u)=>Cacher.getUser(u as string))
    let userFilterMap = new Map<string, User>()
    for(let u of userFilterArray) {
      userFilterMap.set((u as User)._id!, u!)
    }
    return userFilterMap
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

  getPageNumFromRouter() {
    return isNaN(parseInt(this.router.currentRoute.value.query.pageNum as string)) ? 1 : parseInt(this.router.currentRoute.value.query.pageNum as string)
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
        this.loadPageCallback(localPage, new Date(this.lastStartDate), new Date(this.lastEndDate), this.lastUserFilters, this.lastPartFilters, this.lastHideOtherParts, this.lastPalletFilters, this.lastBoxFilters)
          .then((page) => {
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

  hasPage(pageNum: number, startDate: Date, endDate: Date, userFilters?: string[], partFilters?: string[], hideOtherParts?: boolean, assetFilters?: string[], palletFilters?: string[], boxFilters?: string[]) {
      if(
        startDate.getTime()!=this.lastStartDate||
        endDate.getTime()!=this.lastEndDate ||
        (userFilters?JSON.stringify(userFilters):JSON.stringify([]))!=JSON.stringify(this.lastUserFilters) ||
        (partFilters?JSON.stringify(partFilters):JSON.stringify([]))!=JSON.stringify(this.lastPartFilters) ||
        (assetFilters?JSON.stringify(assetFilters):JSON.stringify([]))!=JSON.stringify(this.lastAssetFilters) ||
        hideOtherParts != this.lastHideOtherParts ||
        (palletFilters?JSON.stringify(palletFilters):JSON.stringify([]))!=JSON.stringify(this.lastPalletFilters) ||
        (boxFilters?JSON.stringify(boxFilters):JSON.stringify([]))!=JSON.stringify(this.lastBoxFilters)
      ) {
        return false
      }
      return this.pageCache.has(pageNum)
  }

  async loadPage(pageNum: number, startDate: Date, endDate: Date, userFilters?: string[], partFilters?: string[], hideOtherParts?: boolean, assetFilters?: string[], palletFilters?: string[], boxFilters?: string[]) {
    return new Promise<Type[]>(async (res)=>{
      let searchParamChanged = false
      // Check for change in search params
      if(
        startDate.getTime()!=this.lastStartDate||
        endDate.getTime()!=this.lastEndDate ||
        (userFilters?JSON.stringify(userFilters):JSON.stringify([]))!=JSON.stringify(this.lastUserFilters) ||
        (partFilters?JSON.stringify(partFilters):JSON.stringify([]))!=JSON.stringify(this.lastPartFilters) ||
        (assetFilters?JSON.stringify(assetFilters):JSON.stringify([]))!=JSON.stringify(this.lastAssetFilters) ||
        hideOtherParts != this.lastHideOtherParts ||
        (palletFilters?JSON.stringify(palletFilters):JSON.stringify([]))!=JSON.stringify(this.lastPalletFilters) ||
        (boxFilters?JSON.stringify(boxFilters):JSON.stringify([]))!=JSON.stringify(this.lastBoxFilters)
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
      this.lastAssetFilters = assetFilters ? JSON.parse(JSON.stringify(assetFilters)) : []
      this.lastHideOtherParts = hideOtherParts == true ? true : false
      this.lastPalletFilters = partFilters ? JSON.parse(JSON.stringify(palletFilters)) : []
      this.lastBoxFilters = assetFilters ? JSON.parse(JSON.stringify(boxFilters)) : []
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
          hideOtherParts: this.lastHideOtherParts ? "true" : "false",
          assets: assetFilters,
          pallets: palletFilters,
          boxes: boxFilters
        }
      });
      // Early return if the request doesn't make sense
      if((pageNum < 1) || ((pageNum > this.numPages)&&!searchParamChanged)) {
        return res(thisPage)
      }
      // If the cache doesn't have the page
      if(!this.pageCache.has(pageNum)) {
        // Load page from callback
        let page = await this.loadPageCallback(pageNum, startDate, endDate, this.lastUserFilters, this.lastPartFilters, this.lastHideOtherParts, this.lastAssetFilters, this.lastPalletFilters, this.lastBoxFilters)
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
