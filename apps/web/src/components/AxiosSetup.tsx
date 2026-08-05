'use client';
import { useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

import { API_BASE_URL } from '../config';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('piks_session_id');
      if (!sessionId) {
        sessionId = `sess-${Math.round(Math.random() * 1e9)}-${Date.now()}`;
        localStorage.setItem('piks_session_id', sessionId);
      }
      axios.post(`${API_BASE_URL}/visitors/hit`, { sessionId })
        .catch(err => console.warn('Failed to record visitor hit:', err));
    }
  }, []);

  return null;
}
