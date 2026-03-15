import axios from 'axios';

const api = axios.create({
    baseURL: 'https://prototype-log-backend-268059657803.southamerica-east1.run.app/api'
});

export default api;