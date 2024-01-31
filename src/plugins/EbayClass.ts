import { InventoryEntry, LoadedCartItem, PartSchema, User } from "./interfaces";
import Inventory from "./InventoryClass";

export default class EbayInventory extends Inventory {

  constructor(thisUser: User, extraSourceUsers?: User[], extraDestUsers?: User[]) {
    // Initialize parent class
    super(thisUser, extraSourceUsers, extraDestUsers);
  }

  move(
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
      item1 = array1.find((e) => e.serial == serial);
      // Return if not found
      if (!item1) {
        return;
      }
      // Remove from array 1
      array1.splice(array1.indexOf(item1), 1);
      // Push to array 2
      array2.push({ part, serial: serial });
    } else {
      // Find matching part in array 1
      item1 = array1.find((e) => e.part.nxid == part.nxid);
      // Return if not found
      if (!item1 || !quantity) {
        return;
      }
      // subtract quantity
      item1.quantity! -= quantity;
      // Remove from array if quantity < 1
      if (item1.quantity! < 1)
        array1.splice(array1.indexOf(item1), 1);
      // If it doesn't exist, push a new entry
      for (let i = 0; i < quantity; i++) {
        array2.push({ part, serial: '' });
      }
    }
    this.refreshComponents()
  }

  moveBack(
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
      item1 = array1.find((e) => e.serial == serial);
      // Return if not found
      if (!item1 && part.serialized) {
        return;
      }
      // Remove from array 1
      array1.splice(array1.indexOf(item1!), 1);
      // Push to array 2
      if (part.serialized) {
        array2.push({ part, serial: serial });
      } else {
        let item2 = array2.find((e) => e.part.nxid == part.nxid);
        // If it doesn't exist, push a new entry
        if (!item2) array2.push({ part, quantity: 1 });
        // Otherwise increment existing entry
        else item2.quantity! += 1;
      }
    } else {
      // Find matching part in array 1
      item1 = array1.find((e) => e.part.nxid == part.nxid);
      // Return if not found
      if (!item1 || !quantity) {
        return;
      }
      // subtract quantity
      item1.quantity! -= quantity;
      // Remove from array if quantity < 1
      if (item1.quantity! < 1)
        array1.splice(array1.indexOf(item1), 1);
      // Find in array 2
      let item2 = array2.find((e) => e.part.nxid == part.nxid);
      // If it doesn't exist, push a new entry
      if (!item2) array2.push({ part, quantity });
      // Otherwise increment existing entry
      else item2.quantity! += quantity;
    }
    this.refreshComponents()
  }

  getOrderList() {
    let transferListHash = new Map<string, InventoryEntry>()
    // Process transfer list
    this.getDestInv().map((item)=> {
      // Create boilerplate
      let invEntry = { newSerials: [], serials: [], unserialized: 0} as InventoryEntry
      // Check if it already exists in map
      if(transferListHash.has(item.part.nxid!))
        invEntry = transferListHash.get(item.part.nxid!)!
      // Update values
      if(item.serial&&item.part.serialized)
        // Push serial to array
        invEntry.serials.push(item.serial)
      // Increment unserialized
      else {
        invEntry.unserialized+=1
        if(item.serial&&item.serial!='') {
          invEntry.newSerials!.push(item.serial)
        }
      }
      //invEntry.unserialized+=item.quantity!
      // Update hash
      transferListHash.set(item.part.nxid!, invEntry)
    })
    // Turn hash map back into array
    let partList = [] as InventoryEntry[]
    transferListHash.forEach((v, k)=>{
      v.nxid = k
      partList.push(v)
    })
    return partList
  }
}
