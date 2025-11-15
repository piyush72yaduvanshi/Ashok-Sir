import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // change if using Railway/Vercel
  withCredentials: true, // sends cookies
});

export default api;