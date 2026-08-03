'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Phone, MapPin, CheckCircle2, Navigation, Copy, CreditCard, ChevronRight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DeliverySheetPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE_URL}/orders/${id}`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setOrder(res.data.data);
        } else {
          setError('Order not found or invalid response.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch delivery details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleCopyAddress = () => {
    if (!order?.shippingAddress) return;
    const addr = `${order.shippingAddress.fullName || ''}, ${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.country || ''} - ${order.shippingAddress.postalCode || ''}`;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-stone-500 font-semibold text-sm">Loading delivery details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ChevronRight className="w-8 h-8 rotate-90" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Information Unavailable</h1>
        <p className="text-stone-500 mt-2 max-w-xs">{error || 'Unable to load details for this order.'}</p>
      </div>
    );
  }

  const isCod = (order.paymentMethod || '').toLowerCase().includes('cod');
  const fullAddress = `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''} - ${order.shippingAddress?.postalCode || ''}`;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 font-sans pb-12">
      {/* Top Status Header */}
      <div className="bg-stone-950 text-white px-6 py-8 rounded-b-[2rem] shadow-lg flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Delivery Console</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isCod ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {isCod ? 'COD Collection' : 'Prepaid'}
          </span>
        </div>
        <h1 className="text-2xl font-black mt-2 tracking-tight">Order #{order.orderId || order._id?.slice(-8).toUpperCase()}</h1>
        <p className="text-xs text-stone-400 font-medium">Assigned Delivery Run Sheet</p>
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-5">
        {/* Recipient Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Recipient Name</span>
              <span className="text-lg font-extrabold text-stone-900">{order.shippingAddress?.fullName || 'Guest Customer'}</span>
            </div>
            {order.shippingAddress?.phone && (
              <a 
                href={`tel:${order.shippingAddress.phone}`}
                className="w-12 h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
              >
                <Phone className="w-5 h-5 fill-current" />
              </a>
            )}
          </div>

          {order.shippingAddress?.phone && (
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">Mobile Number</span>
                <span className="text-sm font-semibold tracking-wide text-stone-700">{order.shippingAddress.phone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Delivery Address</span>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-stone-800 leading-relaxed">{fullAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button 
              onClick={handleCopyAddress}
              className="flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 bg-white"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </a>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block border-b border-stone-100 pb-2">Payment Summary</span>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-600 font-semibold">Payment Mode</span>
            </div>
            <span className="text-sm font-bold text-stone-800 uppercase tracking-wide">
              {isCod ? 'Cash on Delivery' : 'Prepaid Online'}
            </span>
          </div>

          <div className="flex justify-between items-center bg-stone-50 p-3.5 rounded-xl border border-stone-200/50">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Collect Cash Amount</span>
            <span className={`text-xl font-black ${isCod ? 'text-amber-700' : 'text-stone-900'}`}>
              ₹{isCod ? order.totalPrice?.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Delivery Acknowledgment Info */}
        <div className="text-center px-4 mt-2">
          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest leading-relaxed">
            Authorized run sheet for Piks Media logistics delivery network. Please verify customer signature on delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
