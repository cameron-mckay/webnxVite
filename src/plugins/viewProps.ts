import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from './store';

export interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router
    errorHandler: (err: Error | AxiosError) => void
}