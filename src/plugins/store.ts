import { AxiosInstance } from 'axios';
import { App, InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { getCurrentUser } from './dbCommands/userManager';
import type { CartItem, PartSchema, User, UserState } from './interfaces';
// Injection key
export const key: InjectionKey<Store<UserState>> = Symbol();

// Called with app.use(store)
export function createGlobalStore(app: App): Store<UserState> {
  // Create store
  const store = createStore({
    state: (): UserState => ({
      isAuth: false,
      user: {},
      http: app.config.globalProperties.$http,
      cart: {
        serialized: [] as CartItem[],
        unserialized: new Map<string, number>(),
      },
    }),
    getters: {
      getQuantity: (state: UserState) => (id: string) => {
        if (state.cart.unserialized.has(id)) {
          return state.cart.unserialized.get(id);
        } else {
          let count = 0;
          state.cart.serialized.map((item) => {
            if (item.nxid == id) count++;
          });
          return count;
        }
      },
      getTotalNumItems: (state: UserState) => {
        let num = 0;
        for (let item of state.cart.unserialized.values()) {
          num += item;
        }
        num += state.cart.serialized.length;
        return num;
      },
    },
    mutations: {
      // Logout user
      logout(state: UserState, http: AxiosInstance) {
        localStorage.removeItem('token');
        state.isAuth = false;
        http.defaults.headers['Authorization'] = '';
      },
      // Add ID of item to store
      addToCart(state: UserState, part: PartSchema) {
        if (state.cart.unserialized.has(part.nxid!)) {
          state.cart.unserialized.set(
            part.nxid!,
            state.cart.unserialized.get(part.nxid!)! + 1
          );
        } else if (part.serialized) {
          state.cart.serialized.push({ nxid: part.nxid!, serial: '' });
        } else state.cart.unserialized.set(part.nxid!, 1);
      },
      addOne(state: UserState, id: string) {
        if (state.cart.unserialized.has(id)) {
          state.cart.unserialized.set(id, state.cart.unserialized.get(id)! + 1);
        }
      },
      setQuantity(state: UserState, req: { id: string, quantity: number }) {
        if(req.quantity<1)
          return state.cart.unserialized.delete(req.id)
        state.cart.unserialized.set(req.id, req.quantity);
      },
      // Remove item of ID from
      removeOne(state: UserState, id: string) {
        if (state.cart.unserialized.has(id)) {
          state.cart.unserialized.set(id, state.cart.unserialized.get(id)! - 1);
          if (state.cart.unserialized.get(id)! < 1)
            state.cart.unserialized.delete(id);
        } else {
          let index = state.cart.serialized.findIndex(
            (e) => e.nxid == id && e.serial == ''
          );
          if (index < 0)
            index = state.cart.serialized.findIndex((e) => e.nxid == id);
          state.cart.serialized.splice(index, 1);
        }
      },
      removeAll(state: UserState, id: string) {
        if (state.cart.unserialized.has(id)) {
          state.cart.unserialized.delete(id);
        } else {
          while (state.cart.serialized.findIndex((e) => e.nxid == id) >= 0) {
            let index = state.cart.serialized.findIndex((e) => e.nxid == id);
            state.cart.serialized.splice(index, 1);
          }
        }
      },
      emptyCart(state: UserState) {
        state.cart.unserialized = new Map<string, number>();
        state.cart.serialized = [];
      },
      setSerial(state: UserState, test: CartItem) {
        state.cart.serialized[test.quantity!] = {
          nxid: state.cart.serialized[test.quantity!].nxid,
          serial: test.serial,
        };
      },
      removeSerialized(state: UserState, index: number) {
        if (index >= 0 && state.cart.serialized.length > index) {
          state.cart.serialized.splice(index, 1);
        }
      },
      duplicateSerialized(state: UserState, index: number) {
        if (index >= 0 && state.cart.serialized.length > index) {
          state.cart.serialized.splice(index + 1, 0, {
            nxid: state.cart.serialized[index].nxid,
            serial: '',
          });
        }
      },
      // Uses token to fetch user data from the API
      updateUserData(state: UserState, user: User) {
        store.state.user = user
        store.state.isAuth = true
      },
    },
  });
  // Just in case
  app.config.globalProperties.$store = store;
  // return store instance
  return store;
}

// Returns global store instance
export function useStore(): Store<UserState> {
  return baseUseStore(key);
}
