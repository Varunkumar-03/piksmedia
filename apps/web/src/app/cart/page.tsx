'use client';
import { API_BASE_URL } from '../../config';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Minus, Plus, Trash2, ArrowRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import useCartStore from '../../store/useCartStore';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const { items, updateQuantity, removeItem, cartTotal, updateItemData } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const fetchLatestData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/catalog/products`);
        const products = res.data.data;
        const currentItems = useCartStore.getState().items;
        
        currentItems.forEach(item => {
          const product = products.find((p: any) => p._id === item.productId);
          if (product) {
            const latestDelivery = product.deliveryCharges || 0;
            const latestThreshold = product.freeShippingThreshold || 0;
            if (item.deliveryCharges !== latestDelivery || item.freeShippingThreshold !== latestThreshold) {
              useCartStore.getState().updateItemData(item.id, { 
                deliveryCharges: latestDelivery,
                freeShippingThreshold: latestThreshold
              });
            }
          }
        });
      } catch (err) {
        console.error('Failed to sync cart data', err);
      }
    };
    if (useCartStore.getState().items.length > 0) {
      fetchLatestData();
    }
  }, []);

  const subtotal = cartTotal();
  const shippingTotal = items.reduce((total, item) => total + (item.deliveryCharges || 0) * item.quantity, 0);
  
  // Find minimum free shipping threshold set on products in cart (or default fallback 10000)
  const productThresholds = items.map(item => item.freeShippingThreshold || 0).filter(t => t > 0);
  const activeThreshold = productThresholds.length > 0 ? Math.min(...productThresholds) : 10000;

  const isFreeShipping = activeThreshold > 0 && subtotal >= activeThreshold;
  const finalShipping = isFreeShipping ? 0 : shippingTotal;

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <div className="container mx-auto px-6 pt-8 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-stone-500 mb-8">Looks like you haven't added any premium frames yet.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-stone-800 transition-all">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg text-stone-800">{item.title}</h3>
                          <p className="text-stone-500 text-sm mt-1">Size: {item.size}</p>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1">
                          <button 
                            onClick={() => {
                              if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                            }}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-stone-500 hover:text-stone-900"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm sticky top-24">
                <h3 className="text-xl font-medium mb-6">Order Summary</h3>
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-medium">₹{cartTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Shipping</span>
                    <span className="font-medium">{isFreeShipping ? 'Free' : `₹${finalShipping}`}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="font-medium text-base">Total</span>
                      <span className="text-2xl font-medium tracking-tight">
                        ₹{cartTotal() + finalShipping}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-stone-900 text-white h-14 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-stone-800 transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
