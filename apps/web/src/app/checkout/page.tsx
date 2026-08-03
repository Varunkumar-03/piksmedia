'use client';
import { API_BASE_URL } from '../../config';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft, MapPin, Plus, Check, Edit2 } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import useMascotStore from '../../store/useMascotStore';
import axios from 'axios';

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const { items, cartTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | 'new'>('new');
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [adminDeliveryLocations, setAdminDeliveryLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeliveryLocations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/delivery-locations`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setAdminDeliveryLocations(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch delivery locations', err);
      }
    };
    fetchDeliveryLocations();
  }, []);

  const getPincodeDeliveryInfo = useCallback((pincode: string) => {
    const clean = (pincode || '').replace(/\D/g, '');
    if (clean.length !== 6) return null;

    // Check if pincode is present in admin-configured delivery locations
    const match = adminDeliveryLocations.find((l: any) => {
      const code = typeof l === 'string' ? l : l.pincode;
      return code === clean;
    });

    if (!match) {
      return {
        isDeliverable: false,
        type: 'not_deliverable',
        text: '✕ Delivery is currently not available for this postal code.',
        textColor: 'text-red-600'
      };
    }

    const deliveryType = typeof match === 'object' && match.deliveryType ? match.deliveryType : 'standard';

    if (deliveryType === 'free') {
      return {
        isDeliverable: true,
        type: 'free_delivery',
        text: '✓ Location is deliverable • Available for FREE Express Delivery!',
        textColor: 'text-emerald-700'
      };
    }

    if (deliveryType === 'sameday') {
      return {
        isDeliverable: true,
        type: 'same_day_delivery',
        text: '✓ Location is deliverable • Available for Same Day Delivery!',
        textColor: 'text-amber-800'
      };
    }

    return {
      isDeliverable: true,
      type: 'deliverable',
      text: '✓ Location is deliverable • Standard Delivery Available',
      textColor: 'text-emerald-700'
    };
  }, [adminDeliveryLocations]);

  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'Credit Card'
  });

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else if (mounted && isAuthenticated && items.length > 0) {
      useMascotStore.getState().triggerMood(
        2,
        "Almost there! Select your delivery address so we can craft and deliver your frames! 🚚",
        8000,
        'checkout'
      );
    }
  }, [mounted, isAuthenticated, router, items.length]);

  // Fetch saved addresses for checkout pre-filling
  useEffect(() => {
    if (mounted) {
      const fetchAddresses = async () => {
        try {
          const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';
          const res = await axios.get(`${API_BASE_URL}/users/addresses`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (res.data.success && res.data.data.length > 0) {
            const addrs = res.data.data;
            setSavedAddresses(addrs);
            // Default to default address or first address
            const defaultAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
            setSelectedAddrId(defaultAddr._id);
            setFormData(prev => ({
              ...prev,
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              address: defaultAddr.address,
              city: defaultAddr.city,
              state: defaultAddr.state || '',
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country || 'India',
            }));
          }
        } catch (err) {
          console.error('Failed to load saved addresses', err);
        }
      };
      fetchAddresses();
    }
  }, [mounted, token]);

  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddrId(addr._id);
    setEditingAddrId(null);
    setFormData(prev => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country || 'India',
    }));
  };

  const handleSelectNewAddress = () => {
    setSelectedAddrId('new');
    setEditingAddrId(null);
    setFormData(prev => ({
      ...prev,
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      phone: user?.phone || '',
      address: '',
      city: '',
      postalCode: '',
      country: 'India',
    }));
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddrId(addr._id);
    setSelectedAddrId('edit');
    setFormData(prev => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country || 'India',
    }));
  };

  const handleSaveEditedAddress = async () => {
    if (!editingAddrId) return;
    const targetId = editingAddrId;
    try {
      const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';
      const res = await axios.put(`${API_BASE_URL}/users/addresses/${targetId}`, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSavedAddresses(res.data.data);
      } else {
        // Optimistic local update as fallback
        setSavedAddresses(prev => prev.map(a => String(a._id) === String(targetId) ? {
          ...a,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        } : a));
      }
      setSelectedAddrId(targetId);
      setEditingAddrId(null);
    } catch (err: any) {
      console.error('Failed to update address', err);
      // Even on network glitch, optimistically update UI so address card is never blank
      setSavedAddresses(prev => prev.map(a => String(a._id) === String(targetId) ? {
        ...a,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      } : a));
      setSelectedAddrId(targetId);
      setEditingAddrId(null);
    }
  };

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [offersList, setOffersList] = useState<any[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [enteredCouponCode, setEnteredCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/catalog/products`)
      .then(res => {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          setAllProducts(list);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/settings/coupons`)
      .then(res => {
        if (res.data?.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          setCouponsList(res.data.data.filter((c: any) => {
            if (!c.isActive) return false;
            if (c.expiryDate && new Date(c.expiryDate) < today) return false;
            return true;
          }));
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/settings/offers`)
      .then(res => {
        if (res.data?.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          setOffersList(res.data.data.filter((o: any) => {
            if (!o.isActive) return false;
            if (o.expiryDate && new Date(o.expiryDate) < today) return false;
            return true;
          }));
        }
      })
      .catch(console.error);
  }, []);

  const getItemCategory = (productId: string) => {
    const prod = allProducts.find(p => p._id === productId);
    if (!prod) return '';
    if (typeof prod.category === 'object') return prod.category.name || '';
    return prod.category || '';
  };

  if (!mounted || !isAuthenticated) return null;

  const total = cartTotal();
  const deliveryInfo = getPincodeDeliveryInfo(formData.postalCode);
  const isFreeDelivery = deliveryInfo?.type === 'free_delivery';
  const shippingTotal = items.reduce((sum, item) => sum + (item.deliveryCharges || 0) * item.quantity, 0);
  
  const productThresholds = items.map(item => item.freeShippingThreshold || 0).filter(t => t > 0);
  const activeThreshold = productThresholds.length > 0 ? Math.min(...productThresholds) : 10000;
  const isThresholdFree = activeThreshold > 0 && total >= activeThreshold;

  const shipping = isFreeDelivery || isThresholdFree ? 0 : shippingTotal;

  // Calculate discount from selected offer
  let offerDiscount = 0;
  if (selectedOfferId) {
    const offer = offersList.find(o => o._id === selectedOfferId);
    if (offer) {
      if (!offer.category || offer.category === 'all') {
        if (offer.discountType === 'percentage') {
          offerDiscount = total * (Number(offer.discountValue) / 100);
        } else {
          offerDiscount = Number(offer.discountValue);
        }
      } else {
        const targetCategory = offer.category.toLowerCase();
        items.forEach(item => {
          const itemCat = getItemCategory(item.productId).toLowerCase();
          if (itemCat === targetCategory) {
            if (offer.discountType === 'percentage') {
              offerDiscount += (item.price * item.quantity) * (Number(offer.discountValue) / 100);
            } else {
              offerDiscount += Math.min(item.price * item.quantity, Number(offer.discountValue));
            }
          }
        });
      }
    }
  }

  // Calculate discount from applied coupon
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = total * (Number(appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = Number(appliedCoupon.discountValue);
    }
  }

  const totalDiscount = Math.round(Math.min(total, offerDiscount + couponDiscount) * 100) / 100;
  const finalTotal = Math.round(Math.max(0, total - totalDiscount + shipping) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mandatory 6-digit postal code validation
    const cleanPostal = formData.postalCode.trim();
    if (!/^\d{6}$/.test(cleanPostal)) {
      setError('Postal code is mandatory and must contain exactly 6 digits (e.g. 560001).');
      setLoading(false);
      return;
    }

    const deliveryInfo = getPincodeDeliveryInfo(cleanPostal);
    if (deliveryInfo && !deliveryInfo.isDeliverable) {
      setError('Delivery is currently not available for this postal code. Please choose a serviceable location.');
      setLoading(false);
      return;
    }

    try {
      setIsRedirecting(true);
      await new Promise(resolve => setTimeout(resolve, 2200));
      // If user entered a new address and opted to save it to their account
      if (selectedAddrId === 'new' && saveToAccount && token) {
        try {
          await axios.post(`${API_BASE_URL}/users/addresses`, {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: cleanPostal,
            country: formData.country,
            isDefault: savedAddresses.length === 0,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (addrErr) {
          console.warn('Could not auto-save address to user account', addrErr);
        }
      }

      const orderItems = items.map(item => ({
        product: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        image: item.image,
        userImage: item.userImage,
        customScaleX: item.customScaleX,
        customScaleY: item.customScaleY,
        customX: item.customX,
        customY: item.customY,
        instructions: item.instructions
      }));

      const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null);

      const res = await axios.post(`${API_BASE_URL}/orders`, {
        orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: cleanPostal,
          country: formData.country,
          email: formData.email || user?.email || ''
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: total,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: finalTotal,
        user: user?._id || (user as any)?.id
      }, {
        headers: {
          ...(authToken && authToken !== 'null' && authToken !== 'undefined' ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });

      if (res.data.success) {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const newOrder = res.data.data || {
          _id: `PKM-${yy}${mm}-${String(Math.floor(1 + Math.random() * 999)).padStart(3, '0')}`,
          orderItems,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: cleanPostal,
            country: formData.country,
            email: formData.email || user?.email || ''
          },
          paymentMethod: formData.paymentMethod,
          itemsPrice: total,
          taxPrice: 0,
          shippingPrice: shipping,
          totalPrice: finalTotal,
          user: user?._id || (user as any)?.id,
          createdAt: new Date().toISOString(),
          status: 'Processing',
          isDelivered: false
        };

        try {
          const existingPlaced = JSON.parse(localStorage.getItem('piks_placed_orders') || '[]');
          localStorage.setItem('piks_placed_orders', JSON.stringify([newOrder, ...existingPlaced]));
        } catch (cacheErr) {
          console.warn('Failed to cache placed order locally', cacheErr);
        }

        if (authToken) {
          try {
            await axios.post(`${API_BASE_URL}/users/addresses`, {
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: cleanPostal,
              country: formData.country,
              isDefault: true
            }, {
              headers: { Authorization: `Bearer ${authToken}` }
            });
          } catch (e) {
            console.error('Failed to auto-save address to account', e);
          }
        }

        setSuccess(true);
        clearCart();
        useMascotStore.getState().triggerMood(
          12,
          "YAY! 🎉 Order placed successfully! We're hand-crafting your frames right now!",
          12000,
          'order_placed'
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
      setIsRedirecting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center px-6">
        <CheckCircle2 className="w-20 h-20 text-stone-900 mb-6" />
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Order Confirmed</h1>
        <p className="text-stone-500 mb-8 max-w-md">
          Thank you for choosing Piks Media. Your premium frames are being prepared and will be shipped to you soon.
        </p>
        <Link href="/" className="bg-stone-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-stone-800 transition-all">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <nav className="w-full py-4 px-8 flex items-center justify-center bg-white border-b border-stone-200">
        <Link href="/" className="flex items-center gap-3 text-stone-900 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Piks Media Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight text-stone-900 border-l border-stone-300 pl-3">Checkout</span>
        </Link>
      </nav>

      <div className="container mx-auto px-6 pt-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 flex-col-reverse lg:flex-row">
          {/* Form Side */}
          <div className="lg:col-span-7">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
              {/* Contact Info (auto-filled) */}
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h2 className="text-xl font-medium mb-4">Contact Information</h2>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block font-medium uppercase tracking-wider">Logged in as</span>
                    <span className="text-sm font-semibold text-stone-900">{formData.email}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Verified</span>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Delivery Address</h2>
                  {savedAddresses.length > 0 && selectedAddrId !== 'new' && (
                    <button
                      type="button"
                      onClick={handleSelectNewAddress}
                      className="text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ship to New Address
                    </button>
                  )}
                </div>

                {/* If user has saved addresses, display address selector */}
                {savedAddresses.length > 0 && selectedAddrId !== 'new' && selectedAddrId !== 'edit' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                        {showAllAddresses ? 'Select shipping address' : 'Selected Shipping Address'}
                      </span>
                      {!showAllAddresses && (
                        <button
                          type="button"
                          onClick={() => setShowAllAddresses(true)}
                          className="text-xs font-bold text-stone-900 hover:text-[#907341] bg-stone-100 hover:bg-stone-200/80 px-3 py-1 rounded-lg transition-colors border border-stone-200"
                        >
                          Change Address
                        </button>
                      )}
                      {showAllAddresses && (
                        <button
                          type="button"
                          onClick={() => setShowAllAddresses(false)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          Close List
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {showAllAddresses ? (
                        savedAddresses.map((addr) => {
                          const isSelected = selectedAddrId === addr._id;
                          return (
                            <div
                              key={addr._id}
                              onClick={() => {
                                handleSelectAddress(addr);
                                setShowAllAddresses(false);
                              }}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-stone-900">{addr.fullName}</span>
                                    {addr.isDefault && (
                                      <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-stone-600 mt-1">{addr.address}</p>
                                  <p className="text-sm text-stone-600">{addr.city}{addr.state ? `, ${addr.state}` : ''}, <span className="font-semibold text-stone-900">{addr.postalCode}</span> • {addr.country || 'India'}</p>
                                  <p className="text-xs text-stone-500 mt-1">📞 {addr.phone}</p>
                                  {(() => {
                                    const info = getPincodeDeliveryInfo(addr.postalCode);
                                    if (!info) return null;
                                    return (
                                      <p className={`mt-2 text-xs font-medium ${info.textColor}`}>
                                        {info.text}
                                      </p>
                                    );
                                  })()}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(addr);
                                }}
                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors shrink-0"
                                title="Edit Address"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        (() => {
                          const activeAddr = savedAddresses.find(a => a._id === selectedAddrId) || savedAddresses[0];
                          if (!activeAddr) return null;
                          return (
                            <div
                              className="p-5 rounded-2xl border border-stone-900 bg-stone-50/50 flex items-start justify-between gap-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-stone-950 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                                  ✓
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-stone-900">{activeAddr.fullName}</span>
                                    {activeAddr.isDefault && (
                                      <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-stone-600 mt-1">{activeAddr.address}</p>
                                  <p className="text-sm text-stone-600">{activeAddr.city}{activeAddr.state ? `, ${activeAddr.state}` : ''}, <span className="font-semibold text-stone-900">{activeAddr.postalCode}</span> • {activeAddr.country || 'India'}</p>
                                  <p className="text-xs text-stone-500 mt-1">📞 {activeAddr.phone}</p>
                                  {(() => {
                                    const info = getPincodeDeliveryInfo(activeAddr.postalCode);
                                    if (!info) return null;
                                    return (
                                      <p className={`mt-2 text-xs font-medium ${info.textColor}`}>
                                        {info.text}
                                      </p>
                                    );
                                  })()}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(activeAddr);
                                }}
                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors shrink-0"
                                title="Edit Address"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )}

                {/* Form for manual input if user has no saved addresses OR chose 'Ship to New Address' OR editing existing */}
                {(savedAddresses.length === 0 || selectedAddrId === 'new' || selectedAddrId === 'edit') && (
                  <div className="space-y-4 pt-2 border-t border-stone-100">
                    {savedAddresses.length > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-stone-800">
                          {selectedAddrId === 'edit' ? 'Edit Shipping Address' : 'Enter New Shipping Address'}
                        </span>
                        <div className="flex items-center gap-3">
                          {selectedAddrId === 'edit' && (
                            <button
                              type="button"
                              onClick={handleSaveEditedAddress}
                              className="text-xs font-semibold bg-stone-900 text-white px-3 py-1 rounded-full hover:bg-stone-800 transition-colors"
                            >
                              Update Address
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectAddress(savedAddresses[0])}
                            className="text-xs text-stone-600 hover:text-stone-900 underline"
                          >
                            Use Saved Address
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="Flat / House No., Street, Area"
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="Mumbai"
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          placeholder="Maharashtra"
                          value={formData.state}
                          onChange={e => setFormData({...formData, state: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Postal Code (6 digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="400001"
                          value={formData.postalCode}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setFormData({...formData, postalCode: val});
                          }}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm tracking-widest font-mono"
                        />
                        <p className="text-[11px] text-stone-400 mt-1">Must be exactly 6 digits.</p>
                        {(() => {
                          const info = getPincodeDeliveryInfo(formData.postalCode);
                          if (!info) return null;
                          return (
                            <p className={`mt-2 text-xs font-medium ${info.textColor} animate-in fade-in duration-200`}>
                              {info.text}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveToAccount"
                        checked={saveToAccount}
                        onChange={e => setSaveToAccount(e.target.checked)}
                        className="w-4 h-4 text-stone-900 rounded focus:ring-stone-900 cursor-pointer"
                      />
                      <label htmlFor="saveToAccount" className="text-sm font-medium text-stone-700 cursor-pointer">
                        Save this delivery address to my account for future orders
                      </label>
                    </div>
                  </div>
                )}
              </div>



              <button 
                type="submit" 
                disabled={loading || items.length === 0}
                className="hidden lg:flex w-full bg-stone-900 text-white h-14 rounded-full items-center justify-center gap-2 font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 text-base shadow-lg shadow-stone-900/10"
              >
                {loading ? 'Processing...' : `Pay ₹${finalTotal}`}
              </button>
            </form>
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-5">
            <div className="bg-stone-50 p-5 sm:p-8 rounded-2xl border border-stone-200 sticky top-8">
              <h3 className="text-xl font-medium mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-stone-200 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-stone-800">{item.title}</h4>
                      <p className="text-xs text-stone-500">{item.size}</p>
                    </div>
                    <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Promo Offers Selection */}
              {offersList.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded-xl border border-stone-200">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Available Offers</label>
                  <select 
                    value={selectedOfferId} 
                    onChange={e => setSelectedOfferId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg outline-none focus:border-stone-900 text-xs bg-stone-50 font-medium"
                  >
                    <option value="">-- Select an offer --</option>
                    {offersList.map(o => {
                      const typeStr = o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`;
                      const catStr = !o.category || o.category === 'all' ? 'All Products' : `${o.category} Products`;
                      return (
                        <option key={o._id} value={o._id}>
                          {o.title} ({typeStr} OFF on {catStr})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Coupon Code Entry */}
              <div className="mb-6 p-4 bg-white rounded-xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Apply Coupon</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ENTER COUPON CODE" 
                    value={enteredCouponCode} 
                    onChange={e => {
                      setEnteredCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                      setCouponSuccess('');
                    }}
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg outline-none focus:border-stone-900 text-xs font-mono uppercase bg-stone-50"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!enteredCouponCode.trim()) return;
                      const coupon = couponsList.find(c => c.code === enteredCouponCode.trim());
                      if (!coupon) {
                        setCouponError('Invalid coupon code.');
                        setAppliedCoupon(null);
                        return;
                      }
                      if (total < Number(coupon.minSpend || 0)) {
                        setCouponError(`Min spend of ₹${coupon.minSpend} required.`);
                        setAppliedCoupon(null);
                        return;
                      }
                      setAppliedCoupon(coupon);
                      setCouponSuccess(`Coupon code applied!`);
                      setCouponError('');
                    }}
                    className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-650 mt-1.5 font-medium">✕ {couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">✓ {couponSuccess}</p>}
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-150 text-[11px] text-emerald-800">
                    <span className="font-mono font-bold">Code {appliedCoupon.code} Active</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        setEnteredCouponCode('');
                        setCouponSuccess('');
                      }} 
                      className="text-emerald-900 hover:text-emerald-950 font-bold uppercase tracking-wider text-[9px]"
                    >
                      [Remove]
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm pt-6 border-t border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                {offerDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Offer Discount</span>
                    <span>-₹{offerDiscount}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium">₹{shipping}</span>
                  )}
                </div>
                <div className="border-t border-stone-200 pt-4 mt-2">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-base">Total</span>
                    <span className="text-2xl font-medium tracking-tight">₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading || items.length === 0}
              className="lg:hidden mt-6 w-full bg-stone-900 text-white h-14 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 text-base shadow-lg shadow-stone-900/10"
            >
              {loading ? 'Processing...' : `Pay ₹${finalTotal}`}
            </button>
          </div>
        </div>
      </div>
      
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center max-w-sm px-6">
            <div className="w-16 h-16 border-4 border-[#907341]/20 border-t-[#907341] rounded-full animate-spin mb-8"></div>
            <h3 className="text-2xl font-serif font-medium text-stone-900 mb-3 tracking-tight">
              Secure Gateway Redirect
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              We are connecting you securely to the payment portal. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
