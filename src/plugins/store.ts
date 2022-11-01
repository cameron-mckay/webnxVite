import { Store, createStore, useStore as baseUseStore } from 'vuex'
import { App, InjectionKey } from 'vue'
import { getCurrentUser } from './dbCommands'
import { AxiosInstance } from 'axios'
import type { UserState, User, CartItem } from './interfaces'
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
            getQuantity: (state: UserState) => (id: string) =>{
                for (let item of state.cart)
                {
                    if(item.id == id)
                    {
                        return item.quantity;
                    }
                }
                return 0
            },
            getTotalNumItems: (state: UserState) => {
                let num = 0
                for (let item of state.cart){
                    num += item.quantity
                }
                return num
            }
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
            async logout(state: UserState, http: AxiosInstance) {
                localStorage.removeItem("token")
                state.isAuth = false;
                http.defaults.headers["Authorization"] = ""
            },
            // Add ID of item to store
            addToCart(state: UserState, id: string) {
                let found = false;
                for(let i = 0; i < state.cart.length; i++)
                {
                    // Loop through each item and see if it 
                    // already exists
                    if(store.state.cart[i].id == id)
                    {
                        // Increment item
                        store.state.cart[i].quantity += 1;
                        i = store.state.cart.length
                        found = true;
                    }
                }
                if(!found){
                    let item:CartItem = { id, quantity: 1}
                    state.cart.push(item)
                }
            },
            addOne(state: UserState, id: string){
                for(let i = 0; i < state.cart.length; i++)
                {
                    if(state.cart[i].id == id)
                    {
                        state.cart[i].quantity += 1;
                    }
                }
            },
            // Remove item of ID from 
            removeOne(state: UserState, id: string) {
                for(let i = 0; i < state.cart.length; i++)
                {
                    if(state.cart[i].id == id && state.cart[i].quantity == 1)
                    {
                        state.cart.splice(i, 1);
                    }
                    else if(state.cart[i].id == id)
                    {
                        state.cart[i].quantity -= 1;
                    }
                }
            },
            removeAll(state: UserState, id: string) {
                for(let i = 0; i < state.cart.length; i++)
                {
                    if(state.cart[i].id == id)
                    {
                        state.cart.splice(i, 1);
                    }
                }
            },
            emptyCart(state: UserState) {
                state.cart = []
            },
            // Uses token to fetch user data from the API
            async updateUserData(state: UserState, user: object) {
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