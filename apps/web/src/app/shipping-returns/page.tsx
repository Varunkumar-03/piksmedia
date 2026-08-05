'use client';

import Navbar from '../../components/Navbar';
import { ChevronLeft, Truck, RefreshCcw, ShieldCheck, Box } from 'lucide-react';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function ShippingReturnsPage() {
  const [content, setContent] = useState({
    processingTime: "Custom frames take 3-5 business days to craft in our workshop. Standard prints and accessories ship within 1-2 business days.",
    guarantee: "If your frame arrives damaged or with any defects, we will replace it immediately at no cost to you. Please report issues within 48 hours of delivery.",
    customOrders: "Because custom frames are cut to your exact specifications, they cannot be returned or exchanged due to buyer's remorse or measurement errors.",
    standardItems: "Non-custom items (like pre-sized frames or accessories) can be returned within 30 days of delivery. Items must be in original packaging. A 10% restocking fee applies."
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings/support-content`)
      .then((res) => {
        if (res.data?.data?.shipping) {
          setContent(res.data.data.shipping);
        } else {
          const saved = localStorage.getItem('piks_support_content');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.shipping) {
              setContent(parsed.shipping);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load shipping policy:', err);
        const saved = localStorage.getItem('piks_support_content');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.shipping) {
            setContent(parsed.shipping);
          }
        }
      });
  }, []);
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <section className="relative pt-12 pb-12 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Shipping & Returns
          </h1>
          <p className="text-lg text-stone-600">
            Everything you need to know about getting your order and our guarantee.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          
          {/* Shipping Section */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Shipping Policy</h2>
            
            <div className="space-y-6 text-stone-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-stone-900 mb-2">Processing Time</h3>
                <p>{content.processingTime}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-stone-900 mb-2">Shipping Methods</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Box className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <span><strong>Standard Ground:</strong> 3-5 business days (Free over ₹8,000)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Box className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <span><strong>Expedited:</strong> 2 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Box className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <span><strong>Next Day Air:</strong> 1 business day</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 mb-2">Packaging</h3>
                <p>We use custom-engineered, reinforced packaging designed specifically to protect glass and delicate wooden mouldings during transit.</p>
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mb-6">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Returns & Guarantee</h2>
            
            <div className="space-y-6 text-stone-600 leading-relaxed">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-stone-900 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  Our Quality Guarantee
                </h3>
                <p>{content.guarantee}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-stone-900 mb-2">Custom Orders</h3>
                <p>{content.customOrders}</p>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 mb-2">Standard Items</h3>
                <p>{content.standardItems}</p>
              </div>
              
              <div className="pt-4 border-t border-stone-100">
                <p className="text-sm">Need help with a return? <Link href="/contact" className="text-stone-900 font-medium underline hover:no-underline">Contact Support</Link></p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
