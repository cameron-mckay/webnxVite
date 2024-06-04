import { advancedSearchCallback, SortType, textSearchCallback } from "./interfaces"
import { Router } from "vue-router"
import Cacher from "./Cacher"
import { DEFAULT_BUILDING } from "./Constants"

export default class TextSearch<Type> {
  // Vue shit
  private router: Router
  // Search cached vars
  private numItems: number
  private numPages: number
  // Store dates from last search
  private lastSearchString: string
  private lastAdvancedSearchObject: Type
  private lastSearchBuilding: number
  private lastSearchAdvanced: boolean
  private lastPageNum: number
  private lastSortString: string
  private lastSortDir: SortType
  // Cache all loaded pages
  private pageCache: Map<number, Type[]>
  // Callback in case of cache miss
  private textSearchCallback: textSearchCallback
  private advancedSearchCallback: advancedSearchCallback
  private loadPageCallback: (pageNum: number)=>void
  private routerDisabled: boolean
  // Constructor for Analytics search - factory funtion should be used instead
  constructor(textSearchCallback: textSearchCallback, advancedSearchCallback: advancedSearchCallback) {
    // Initialize dependencies
    this.router = Cacher.getRouter()
    this.numPages = -1
    this.numItems = -1
    // Initialize caches
    this.pageCache = new Map<number, Type[]>()
    // Cache the last search params
    this.lastSearchString = "asldkfhasdnvcaie"
    this.lastAdvancedSearchObject = {} as Type
    this.lastSearchAdvanced = false
    this.lastSearchBuilding = DEFAULT_BUILDING
    this.lastPageNum = 1
    // Register callback
    this.textSearchCallback = textSearchCallback
    this.advancedSearchCallback = advancedSearchCallback
    this.loadPageCallback = (pageNum)=>{}
    this.routerDisabled = false
    this.lastSortDir = SortType.None
    this.lastSortString = ""
  }
  // Gets the part filters from the provided instance
  static getSearchTextFromRouter(router: Router) {
    return router.currentRoute.value.query.text ? router.currentRoute.value.query.text as string : ""
  }
  // Gets the part filters from the provided instance
  static getPageNumFromRouter(router: Router) {
    return !isNaN(parseInt(router.currentRoute.value.query.pageNum as string)) ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  }
  // Checks if the search mode is advanced
  static isSearchAdvanced(router: Router) {
    return (router.currentRoute.value.query.advanced as string) == "true"
  }
  // Gets the advanced search object
  static getAdvancedSearchObjectFromRouter(router: Router) {
    let { query } = router.currentRoute.value
    let searchObject = {} as any
    for (const key in query) {
      if (key != "advanced" && key != "pageNum" && key != "pageSize")
        searchObject[key] = query[key];
    }
    return searchObject
  }

  static getSortOptionsFromRouter(router: Router) {
    let { query } = router.currentRoute.value
    let sortString = query.sortString ? query.sortString as string : ""
    let sortDir = query.sortDir ? parseInt(query.sortDir as string) as SortType : SortType.None
    return { sortString, sortDir}
  }

  isSearchAdvanced() {
    if(!this.routerDisabled)
      return TextSearch.isSearchAdvanced(this.router)
    return false
  }

  getAdvancedSearchObjectFromRouter() {
    if(!this.routerDisabled)
      return TextSearch.getAdvancedSearchObjectFromRouter(this.router)
    return {}
  }

  getSearchTextFromRouter() {
    if(!this.routerDisabled)
      return TextSearch.getSearchTextFromRouter(this.router)
    return ""
  }

  getPageNumFromRouter() {
    if(!this.routerDisabled)
      return TextSearch.getPageNumFromRouter(this.router)
    return 1
  }

  getSortOptionsFromRouter() {
    if(!this.routerDisabled)
      return TextSearch.getSortOptionsFromRouter(this.router)
    return { sortString: "", sortDir: SortType.None }
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

  wasLastSearchAdvanced() {
    return this.lastSearchAdvanced
  }

  getLastAdvancedSearchObject() {
    return this.lastAdvancedSearchObject
  }

  registerLoadPageCallback(callback: (pageNum: number)=>void) {
    this.loadPageCallback = callback
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
        (this.lastSearchAdvanced ? this.advancedSearchCallback(this.lastSearchBuilding, localPage, this.lastAdvancedSearchObject, this.lastSortString, this.lastSortDir) : this.textSearchCallback(this.lastSearchBuilding, localPage, this.lastSearchString, this.lastSortString, this.lastSortDir))
          .then((page) => {
            // Set new value
            this.numPages = page.pages
            this.numItems = page.total
            this.pageCache.set(localPage, page.items)
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
        (this.lastSearchAdvanced ? this.advancedSearchCallback(this.lastSearchBuilding, localPage, this.lastAdvancedSearchObject, this.lastSortString, this.lastSortDir) : this.textSearchCallback(this.lastSearchBuilding, localPage, this.lastSearchString, this.lastSortString, this.lastSortDir))
          .then((page) => {
            // Set new value
            this.numPages = page.pages
            this.numItems = page.total
            this.pageCache.set(localPage, page.items)
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

  async loadPageAdvanced(building: number, pageNum: number, searchObject: any) {
    return new Promise<Type[]>(async (res, rej) => {
      if(
        !this.lastSearchAdvanced ||
        JSON.stringify(searchObject) != JSON.stringify(this.lastAdvancedSearchObject) ||
        this.lastSearchBuilding != building
      ) {
        this.pageCache.clear()
      }
      this.lastSearchAdvanced = true
      this.lastAdvancedSearchObject = searchObject
      this.lastSearchBuilding = building
      // Build the query object
      let queryObject = JSON.parse(JSON.stringify(searchObject))
      queryObject["advanced"] = "true"
      queryObject["pageNum"] = pageNum.toString()
      if(this.lastSortString!=""&&this.lastSortDir!=SortType.None) {
        queryObject["sortString"] = this.lastSortString
        queryObject["sortDir"] = this.lastSortDir
      }
      // Omit page size from query string
      let pageSize = queryObject["pageSize"]
      delete queryObject.pageSize
      delete queryObject.text
      // Update the router
      if(!this.routerDisabled)
        this.router.replace({
          query: queryObject
        })
      queryObject["pageSize"] = pageSize
      delete searchObject.text
      //
      let thisPage = [] as Type[]
      // Early return if the request doesn't make sense
      if(pageNum < 1) {
        return res(thisPage)
      }
      if(!this.pageCache.has(pageNum)) {
        let page = await this.advancedSearchCallback(building, pageNum, searchObject, this.lastSortString, this.lastSortDir)
        this.numPages = page.pages
        this.numItems = page.total
        this.pageCache.set(pageNum, page.items)
      }
      thisPage = this.pageCache.get(pageNum)!
      // Return the page
      this.loadCache(pageNum)
      res(thisPage)
    })
  }

  newAdvancedSearch(building: number, pageNum: number, searchObject: Type) {
    // Clear the page cache
    this.lastSearchAdvanced = true
    this.lastAdvancedSearchObject = searchObject
    this.lastSearchBuilding = building
    this.pageCache.clear()
    this.loadPageCallback(pageNum)
  }

  forceReloadPage() {
    this.pageCache.clear()
    let pageNum = this.lastPageNum
    // This will cause the reload callback to run
    this.lastPageNum = -1
    // this.lastSearchString = "kajsdfpasidfjj"
    // this.lastAdvancedSearchObject = {} as Type
    this.loadPageCallback(pageNum)
  }

  async loadPage(building: number, pageNum: number, searchString: string) {
    return new Promise<Type[]>(async (res)=>{
      let searchParamChanged = false
      // Check for change in search params
      if(
        this.lastSearchAdvanced ||
        building != this.lastSearchBuilding ||
        searchString != this.lastSearchString
      ) {
        // Clear the page cache
        this.pageCache.clear()
        // Set flag
        searchParamChanged = true
      }
      // Store the new search params
      this.lastSearchAdvanced = false
      this.lastSearchString = searchString
      this.lastSearchBuilding = building
      this.lastPageNum = pageNum
      // Local variable for fetching page
      let thisPage = [] as Type[]
      // Update the router
      if(!this.routerDisabled) {
        let routerObject = {
          query: {
            text: searchString,
            pageNum: pageNum,
          }
        } as any
        if(this.lastSortString!=""&&this.lastSortDir!=SortType.None) {
          routerObject.query.sortString = this.lastSortString
          routerObject.query.sortDir = this.lastSortDir
        }
        this.router.replace(routerObject);
      }
      // Early return if the request doesn't make sense
      if((pageNum < 1) || ((pageNum > this.numPages)&&!searchParamChanged)) {
        return res(thisPage)
      }
      // If the cache doesn't have the page
      if(!this.pageCache.has(pageNum)) {
        // Load page from callback
        let page = await this.textSearchCallback(building, pageNum, searchString, this.lastSortString, this.lastSortDir)
        // Update local info
        this.numPages = page.pages
        this.numItems = page.total
        this.pageCache.set(pageNum, page.items)
      }
      // Load from cache
      thisPage = this.pageCache.get(pageNum)!
      // Return the page
      this.loadCache(pageNum)
      res(thisPage)
    })
  }

  toggleSort(sortName: string) {
    // If sort string changed it will stay ascending
    let newSortDir = SortType.Ascending
    // If the sort string is the same
    if(sortName==this.lastSortString) {
      // Switch on current sort direction
      switch(this.lastSortDir) {
        // If ascending, set to descending
        case SortType.Ascending:
          newSortDir = SortType.Descending
          break
        // If descending, set to none
        case SortType.Descending:
          sortName = ""
          newSortDir = SortType.None
          break
        // If none, set to ascending
        case SortType.None:
          newSortDir = SortType.Ascending
          break
        // Edge case, set to none
        default:
          newSortDir = SortType.None
          break
      }
    }
    this.lastSortString = sortName
    this.lastSortDir = newSortDir
    this.pageCache.clear()
    // if(this.lastSearchAdvanced)
    //   this.loadPageAdvanced(this.lastSearchBuilding, this.lastPageNum, this.lastAdvancedSearchObject)
    // else
    //   this.loadPage(this.lastSearchBuilding, this.lastPageNum, this.lastSearchString)
    return { sortString: sortName, sortDir: newSortDir }
  }

  loadSortFromRouter() {
    let sort = this.getSortOptionsFromRouter()
    this.lastSortDir = sort.sortDir
    this.lastSortString = sort.sortString
  }

  getCurrentSort() {
    return { sortDir: this.lastSortDir, sortString: this.lastSortString }
  }

  disableRouter() {
    this.routerDisabled = true
  }

  forceTextSearchCallback(search: textSearchCallback) {
    search(this.lastSearchBuilding, this.lastPageNum, this.lastSearchString, this.lastSortString, this.lastSortDir)
  }

  forceAdvancedSearchCallback(search: advancedSearchCallback) {
    search(this.lastSearchBuilding, this.lastPageNum, this.lastAdvancedSearchObject, this.lastSortString, this.lastSortDir)
  }
}
