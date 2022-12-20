import { AxiosInstance } from 'axios'
import { App, InjectionKey } from 'vue'
import { Store, useStore as baseUseStore, createStore } from 'vuex'
import { getCurrentUser } from './dbCommands/userManager'
import type { CartItem, User, UserState } from './interfaces'
// Injection key
export const key: InjectionKey<Store<UserState>> = Symbol()

// Called with app.use(store)
export function createGlobalStore(app: App): Store<UserState> {
    // Create store
    const store = createStore({
        state: (): UserState => ({
            isAuth: false,
            user: {},
            http: app.config.globalProperties.$http,
            cart: []
        }),
        getters: {
            getQuantity: (state: UserState) => (id: string) => {
                for (let item of state.cart) {
                    if (item.nxid == id) {
                        return item.quantity;
                    }
                }
                return 0
            },
            getTotalNumItems: (state: UserState) => {
                let num = 0
                for (let item of state.cart) {
                    num += item.quantity
                }
                return num
            },
        },
        mutations: {
            // Sets global authentication to true
            authenticate(state: UserState) {
                state.isAuth = true;
            },
            // Sets global authentication to false
            deauthenticate(state: UserState) {
                state.isAuth = false;
            },
            // Logout user
            logout(state: UserState, http: AxiosInstance) {
                localStorage.removeItem("token")
                state.isAuth = false;
                http.defaults.headers["Authorization"] = ""
            },
            // Add ID of item to store
            addToCart(state: UserState, id: string) {
                let found = false;
                for (let i = 0; i < state.cart.length; i++) {
                    // Loop through each item and see if it 
                    // already exists
                    if (store.state.cart[i].nxid == id) {
                        // Increment item
                        store.state.cart[i].quantity += 1;
                        i = store.state.cart.length
                        found = true;
                    }
                }
                if (!found) {
                    let item: CartItem = { nxid: id, quantity: 1, building: store.state.user.building!, location: "Parts Room" }
                    state.cart.push(item)
                }
            },
            addOne(state: UserState, id: string) {
                for (let i = 0; i < state.cart.length; i++) {
                    if (state.cart[i].nxid == id) {
                        state.cart[i].quantity += 1;
                    }
                }
            },
            // Remove item of ID from 
            removeOne(state: UserState, id: string) {
                for (let i = 0; i < state.cart.length; i++) {
                    if (state.cart[i].nxid == id && state.cart[i].quantity == 1) {
                        state.cart.splice(i, 1);
                    }
                    else if (state.cart[i].nxid == id) {
                        state.cart[i].quantity -= 1;
                    }
                }
            },
            removeAll(state: UserState, id: string) {
                for (let i = 0; i < state.cart.length; i++) {
                    if (state.cart[i].nxid == id) {
                        state.cart.splice(i, 1);
                    }
                }
            },
            emptyCart(state: UserState) {
                state.cart = []
            },
            // Uses token to fetch user data from the API
            updateUserData(state: UserState, user: object) {
                getCurrentUser(app.config.globalProperties.$http, (data, err) => {
                    if (err) {
                        // Error occured - update nothing
                        return
                    }
                    // Success - update global user component
                    state.user = data as User;
                })
            }
        }
    })
    // Just in case
    app.config.globalProperties.$store = store;
    // return store instance
    return store
}

// Returns global store instance
export function useStore(): Store<UserState> {
    return baseUseStore(key)
}
