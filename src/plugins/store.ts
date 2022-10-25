import { Store, createStore, useStore as baseUseStore } from 'vuex'
import { App, createApp, InjectionKey } from 'vue'
import { getCurrentUser } from './dbCommands'
import { AxiosInstance } from 'axios'

// User state interface
export interface UserState {
    isAuth: boolean,
    user: User,
    http: AxiosInstance
    cart: Array<string>
}

// User schema
export interface User {
    admin?: boolean,
    date_created?: string,
    email?: string,
    first_name?: string,
    last_name?: string,
    _v?: number,
    _id?: string
}

// Injection key
export const key: InjectionKey<Store<UserState>> = Symbol()

// Called with app.use(store)
export function createGlobalStore(app: App):Store<UserState> {
    // Create store
    const store = createStore({
        state: (): UserState => ({
            isAuth: false,
            user: {},
            http: app.config.globalProperties.$http,
            cart: []
        }),
        mutations: {
            // Sets global authentication to true
            authenticate(state: UserState){
                state.isAuth = true;
            },
            // Sets global authentication to false
            deauthenticate(state: UserState){
                state.isAuth = false;
            },
            // Add ID of item to store
            addToCart(state: UserState, id: string){
                state.cart.push(id)
            },
            // Remove item of ID from 
            removeFromCart(state: UserState, id: string){
                while(state.cart.indexOf(id)){
                    let i = state.cart.indexOf(id);
                    state.cart.splice(i, 1)
                }
            },
            emptyCart(state: UserState){
                state.cart = []
            },
            // Uses token to fetch user data from the API
            async updateUserData(state: UserState, user: object){
                getCurrentUser(app.config.globalProperties.$http, (data, err) => {
                    if(err){
                        // Error occured - update nothing
                        return
                    }
                    // Success - update global user component
                    state.user = data;
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
export function useStore():Store<UserState>{
    return baseUseStore(key)
}