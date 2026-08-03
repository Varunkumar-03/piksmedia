'use client';

import Navbar from '../../components/Navbar';
import { ChevronLeft, Search, Package, Truck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function TrackOrderContent() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackedStatus, setTrackedStatus] = useState<any>(null);
  const [trackError, setTrackError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTrackedStatus(null);
    setTrackError('');

    const cleanId = orderId.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
      let foundOrder: any = null;

      // 1. Try lookup via API
      try {
        const res = await axios.get(`${API_BASE_URL}/orders/${cleanId}`);
        if (res.data.success && res.data.data) {
          foundOrder = res.data.data;
        }
      } catch (apiErr) {
        // Continue to fallback
      }

      // 2. Fallback to locally cached placed orders
      if (!foundOrder) {
        const localPlaced = JSON.parse(localStorage.getItem('piks_placed_orders') || '[]');
        foundOrder = localPlaced.find((o: any) => 
          String(o._id || o.id || '').toLowerCase() === cleanId.toLowerCase() ||
          (cleanEmail && o.shippingAddress?.email && String(o.shippingAddress.email).toLowerCase() === cleanEmail)
        );
      }

      if (foundOrder) {
        // Optional email verification if email provided
        if (cleanEmail && foundOrder.shippingAddress?.email && foundOrder.shippingAddress.email.toLowerCase() !== cleanEmail) {
          setTrackError(`Order found, but the provided email (${cleanEmail}) does not match the order's email.`);
          return;
        }

        const statusStr = foundOrder.status || (foundOrder.isDelivered ? 'Delivered' : 'Processing');
        const createdDateStr = foundOrder.createdAt 
          ? new Date(foundOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recently';

        const statusUpper = String(statusStr).toUpperCase().replace(/\s+/g, '_');
        const isReturn = statusUpper.includes('RETURN') || statusUpper.includes('REFUND');
        const isReplace = statusUpper.includes('REPLACE') || statusUpper.includes('EXCHANGE') || Boolean(foundOrder.expectedReplacementDate);

        let events: any[] = [];
        if (isReturn) {
          events = [
            { status: 'Return Requested', date: createdDateStr, completed: true },
            { status: statusUpper === 'RETURN_REJECTED' ? 'Return Rejected by Admin' : (statusUpper === 'RETURN_REQUESTED' ? 'Under Review by Admin' : 'Return Approved'), date: 'Completed', completed: statusUpper !== 'RETURN_REQUESTED' },
            { status: 'Pickup Scheduled', date: 'In Progress', completed: statusUpper === 'RETURN_ACCEPTED' || statusUpper === 'REFUND_INITIATED' || statusUpper === 'REFUND_COMPLETED' },
            { status: 'Refund Initiated', date: 'Pending', completed: statusUpper === 'REFUND_INITIATED' || statusUpper === 'REFUND_COMPLETED' },
            { status: 'Refund Completed / Successful', date: 'Pending', completed: statusUpper === 'REFUND_COMPLETED' || statusUpper === 'RETURNED' },
          ];
        } else if (isReplace) {
          events = [
            { status: 'Replacement Requested', date: createdDateStr, completed: true },
            { status: statusUpper.includes('REJECT') ? 'Replacement Rejected by Admin' : (statusUpper === 'REPLACEMENT_REQUESTED' || statusUpper === 'EXCHANGE_REQUESTED' ? 'Under Review by Admin' : 'Replacement Approved'), date: 'Completed', completed: statusUpper !== 'REPLACEMENT_REQUESTED' && statusUpper !== 'EXCHANGE_REQUESTED' },
            { status: 'Original Item Pickup & Verification', date: 'In Progress', completed: statusUpper.includes('ACCEPTED') || statusUpper === 'SHIPPED' || statusUpper === 'DELIVERED' },
            { status: 'Replacement Item Dispatched', date: 'Pending', completed: statusUpper === 'SHIPPED' || statusUpper === 'OUT_FOR_DELIVERY' || statusUpper === 'DELIVERED' },
            { status: 'Replacement Delivered', date: foundOrder.deliveredAt ? new Date(foundOrder.deliveredAt).toLocaleDateString() : 'Pending', completed: statusUpper === 'DELIVERED' || !!foundOrder.isDelivered },
          ];
        } else {
          events = [
            { status: 'Order Placed', date: createdDateStr, completed: true },
            { status: 'Crafting & Quality Check', date: 'In Progress', completed: true },
            { status: 'Shipped', date: foundOrder.isDelivered ? 'Completed' : 'Pending', completed: !!foundOrder.isDelivered || statusStr === 'Shipped' || statusStr === 'Out for Delivery' || statusStr === 'Delivered' },
            { status: 'Out for Delivery', date: foundOrder.isDelivered ? 'Completed' : 'Pending', completed: !!foundOrder.isDelivered || statusStr === 'Out for Delivery' || statusStr === 'Delivered' },
            { status: 'Delivered', date: foundOrder.deliveredAt ? new Date(foundOrder.deliveredAt).toLocaleDateString() : 'Pending', completed: !!foundOrder.isDelivered || statusStr === 'Delivered' },
          ];
        }

        setTrackedStatus({
          id: foundOrder._id || foundOrder.id,
          date: createdDateStr,
          status: statusStr,
          estimatedDelivery: isReturn
            ? (statusUpper === 'REFUND_COMPLETED' ? 'Refund Credited' : 'Est. Refund in 2-4 days')
            : isReplace
            ? (foundOrder.expectedReplacementDate
                ? new Date(foundOrder.expectedReplacementDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                : 'Est. Replacement in 3-5 days')
            : (foundOrder.isDelivered ? 'Delivered' : 'Within 3-5 business days'),
          shippingAddress: foundOrder.shippingAddress,
          totalPrice: foundOrder.totalPrice,
          items: foundOrder.orderItems || [],
          events
        });
      } else {
        setTrackError(`No order found matching Order ID "${cleanId}". Please check your Order ID and try again.`);
      }
    } catch (err: any) {
      setTrackError('An error occurred while tracking your order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <section className="relative pt-12 pb-12 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-stone-600 max-w-xl mx-auto">
            Enter your order number and email address to see the current status of your shipment.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 md:px-12 pb-20">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {trackError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Order Number *</label>
                <input 
                  type="text" 
                  required 
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all text-sm font-mono" 
                  placeholder="e.g. PKM-2607-001" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all text-sm" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold tracking-wide hover:bg-stone-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-stone-400 border-t-white rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {trackedStatus && (
          <div className="mt-12 bg-white p-8 md:p-10 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-6 shadow-xl border border-stone-800 relative overflow-hidden mb-8">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Tracking Order</span>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/15 shadow-inner">
                    #{trackedStatus.id}
                  </span>
                </div>
                <p className="text-xs text-stone-400 flex items-center gap-1.5 pt-0.5">
                  Placed on {trackedStatus.date}
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3 sm:gap-5 flex-wrap">
                <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Est. Delivery</p>
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    {trackedStatus.estimatedDelivery}
                  </p>
                </div>

                <div className="bg-emerald-500/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/20 text-center">
                  <p className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold mb-0.5">Status</p>
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {trackedStatus.status.charAt(0).toUpperCase() + trackedStatus.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            {trackedStatus.items && trackedStatus.items.length > 0 && (
              <div className="mb-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Order Items</h3>
                <div className="space-y-3">
                  {trackedStatus.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-stone-200" />
                        )}
                        <div>
                          <p className="font-semibold text-stone-800">{item.title || item.name}</p>
                          <p className="text-xs text-stone-500">Qty: {item.quantity || item.qty || 1} {item.size ? `• Size: ${item.size}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-medium text-stone-900">₹{item.price || 0}</span>
                    </div>
                  ))}
                </div>
                {trackedStatus.totalPrice && (
                  <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-bold">
                    <span>Total Amount:</span>
                    <span>₹{trackedStatus.totalPrice}</span>
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-stone-100 z-0"></div>
              
              <div className="space-y-8 relative z-10">
                {trackedStatus.events.map((event: any, i: number) => (
                  <div key={i} className="flex items-start gap-6">
                    <div className="relative mt-0.5">
                      {event.completed ? (
                        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center ring-4 ring-white">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center ring-4 ring-white">
                          <Circle className="w-2 h-2 text-stone-200 fill-stone-200" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold ${event.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                        {event.status}
                      </h4>
                      <p className="text-sm text-stone-500 mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}
