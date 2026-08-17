import axios, { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '~/hooks';
import Config from 'react-native-config';
console.log("Config" , Config);
const configAxios = {
    timeout: 30000,
    headers: {
        Accept: 'application/json',
        'Content-Type' : 'application/json',
    },
    baseURL: Config.BASE_API_URL
}
const axiosInstance = axios.create(configAxios)
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig<any>) => {
        const accessToken = useAuthStore.getState().accessToken
        if(config.headers && accessToken){
            config.headers.Authorization = "Bearer " + accessToken
        }
        return config;
    },
    error => {
        Promise.reject(error)
    }
)
axiosInstance.interceptors.response.use(
    response => {
        return response
    },
    error => {
        const apiError = error as {response? : {data?: {message?: string}}}
        if (apiError?.response?.data?.message === 'Please authenticate'){
            useAuthStore.setState({
                accessToken: null,
                refreshToken: null,
                user: null,
            });
        }
        return Promise.reject(error)
    }
)

export default axiosInstance 