import axios, { AxiosInstance } from 'axios'
import { App } from 'vue'
import type { AxiosOptions } from './interfaces'

export const injectionKey = Symbol('http')

// Creates global instance of Axios
export default {
    install: (app: App, options: AxiosOptions) => {
        const http = newAxiosInstance(options)
        app.provide(injectionKey, http)

        app.config.globalProperties.$http = http
    }
}

// Returns a new Axios instance
function newAxiosInstance(options: AxiosOptions):AxiosInstance {
    const http = axios.create({
        baseURL: window.location.origin/*options.baseUrl ? options.baseUrl : import.meta.env.VITE_API_URL,*/,
        headers: {
            common: {
                Authorization: options.token ? options.token : '',
                "Access-Control-Allow-Origin": window.location.origin/*import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : ''*/
            },
        },
        withCredentials: true
    })
    return http;
}