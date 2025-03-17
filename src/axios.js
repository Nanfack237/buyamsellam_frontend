import axios from 'axios';

const token =localStorage.getItem('access_token')
axios.defaults.baseURL = 'http://127.0.0.1:8000/';
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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