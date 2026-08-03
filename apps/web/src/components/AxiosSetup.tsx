'use client';
import { useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

export default function AxiosSetup() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return null;
}
