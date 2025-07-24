import axios from 'axios';

const token = sessionStorage.getItem('access_token')
const selectedStore = sessionStorage.getItem('storeId')
axios.defaults.baseURL = 'http://127.0.0.1:8000/';

if(token){
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
axios.defaults.headers.common['X-Store-ID'] = selectedStore;
  

// Add interceptors if needed
axios.interceptors.request.use(
    (config) => {
        // Modify the request config before it is sent
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        // Modify the response before it is returned
        return response;
    },
    (error) => {
        // Handle response errors
        return Promise.reject(error);
    }
);

export default axios;