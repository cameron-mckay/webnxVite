import { AxiosInstance } from 'axios';
import { App, InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import type { PartSchema, User, UserState } from './interfaces';
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
      parts: new Map<string, number>(),
      notificationCount: 0
    }),
    getters: {
      getQuantity: (state: UserState) => (id: string) => {
        if (state.parts.has(id))
          return state.parts.get(id)
        return 0
      },
      getTotalNumItems: (state: UserState) => {
        let num = 0;
        for (let item of state.parts.values()) {
          num += item;
        }
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
        if (state.parts.has(part.nxid!)) {
          state.parts.set(part.nxid!, state.parts.get(part.nxid!)! + 1);
        } else state.parts.set(part.nxid!, 1);
      },
      addOne(state: UserState, id: string) {
        if (state.parts.has(id)) {
          state.parts.set(id, state.parts.get(id)! + 1);
        }
      },
      setQuantity(state: UserState, req: { id: string, quantity: number }) {
        if(req.quantity<1)
          return state.parts.delete(req.id)
        state.parts.set(req.id, req.quantity);
      },
      // Remove item of ID from
      removeOne(state: UserState, id: string) {
        if (state.parts.has(id)) {
          state.parts.set(id, state.parts.get(id)! - 1);
          if (state.parts.get(id)! < 1)
            state.parts.delete(id);
        }
      },
      removeAll(state: UserState, id: string) {
        if (state.parts.has(id)) {
          state.parts.delete(id);
        }
      },
      emptyCart(state: UserState) {
        state.parts = new Map<string, number>();
      },
      // Uses token to fetch user data from the API
      updateUserData(state: UserState, user: User) {
        state.user = user
        state.isAuth = true
      },
      updateNotificationCount(state: UserState, count: number) {
        state.notificationCount = count
      }
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
