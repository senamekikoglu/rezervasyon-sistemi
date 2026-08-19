import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7240/api',
});

export default api;