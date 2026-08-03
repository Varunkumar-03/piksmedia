'use client';
import { API_BASE_URL } from '../../config';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegalSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/legal`);
        if (res.data.data && res.data.data.privacyPolicy) {
          setContent(res.data.data.privacyPolicy);
          if (res.data.data.privacyPolicyUpdatedAt) {
            setUpdatedAt(res.data.data.privacyPolicyUpdatedAt);
          }
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalSettings();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-stone-900 mb-2 text-center">Privacy Policy</h1>
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
              {content || 'Privacy Policy content is currently unavailable.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
