import axios from 'axios';

// Bypass ngrok free tier browser warning for API calls
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

// Strip absolute localhost URLs from database responses so they work via the Next.js proxy
axios.interceptors.response.use((response) => {
  if (response.data) {
    const jsonString = JSON.stringify(response.data);
    if (jsonString.includes('http://localhost:5000')) {
      response.data = JSON.parse(jsonString.replace(/http:\/\/localhost:5000/g, ''));
    }
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

// Central configuration file for the frontend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ? 'https://api.piksmedia.com/api/v1'
    : 'http://localhost:5000/api/v1');