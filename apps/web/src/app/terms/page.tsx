'use client';
import { API_BASE_URL } from '../../config';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TermsOfServicePage() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegalSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/legal`);
        if (res.data.data && res.data.data.termsOfService) {
          setContent(res.data.data.termsOfService);
          if (res.data.data.termsOfServiceUpdatedAt) {
            setUpdatedAt(res.data.data.termsOfServiceUpdatedAt);
          }
        }
      } catch (error) {
        console.error('Error fetching terms of service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalSettings();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-stone-900 mb-2 text-center">Terms of Service</h1>
        {updatedAt && (
          <p className="text-stone-500 text-center mb-8 text-sm">Last updated: {new Date(updatedAt).toLocaleDateString()}</p>
        )}
        {!updatedAt && <div className="mb-8"></div>}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
            <div className="prose prose-stone max-w-none whitespace-pre-wrap text-stone-600 leading-relaxed">
              {content || 'Terms of Service content is currently unavailable.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
