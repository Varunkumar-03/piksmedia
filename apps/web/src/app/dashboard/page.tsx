'use client';
import { API_BASE_URL } from '../../config';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import { Camera, Package, User, Settings, ArrowRight, Heart, MapPin, Plus, Trash2, Edit2, Check, AlertCircle, Truck, Search, Clock, CheckCircle2, Sparkles, X, XCircle, RotateCcw, RefreshCw, Printer, Box, Home, HelpCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function UserDashboardPage() {
  const { user, isAuthenticated, logout, token } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const handleReorder = (order: any) => {
    if (!order.orderItems || order.orderItems.length === 0) return;
    order.orderItems.forEach((item: any) => {
      const pId = item.product || item.productId || item._id || 'prod';
      const variantKey = `${pId}_${item.size || 'std'}`;
      addItem({
        id: variantKey,
        productId: pId,
        title: item.title || 'Product',
        price: item.price || 0,
        image: item.image || '',
        size: item.size || 'Standard',
        quantity: item.quantity || 1,
        userImage: item.userImage || ''
      });
    });
    router.push('/cart');
  };
  const [activeTab, setActiveTab] = useState('account');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  // Account Profile State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change State
  const [showChangePwForm, setShowChangePwForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [updatingPw, setUpdatingPw] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPwMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setUpdatingPw(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setPwMsg({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPwMsg({ text: err.response?.data?.error || 'Failed to update password.', type: 'error' });
    } finally {
      setUpdatingPw(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/users/profile`,
        { name: profileName, phone: profilePhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, ...res.data.data } : null
        }));
        setProfileMsg('Account details saved successfully!');
      }
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setProfileMsg('Failed to save changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrFormErr, setAddrFormErr] = useState('');
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

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

  const getPincodeDeliveryInfo = (pincode: string) => {
    const clean = (pincode || '').replace(/\D/g, '');
    if (clean.length !== 6) return null;

    if (!adminDeliveryLocations || adminDeliveryLocations.length === 0) {
      return {
        isDeliverable: false,
        text: '✕ Delivery is currently not available for this postal code.',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    const match = adminDeliveryLocations.find((l: any) => {
      const code = typeof l === 'string' ? l : l.pincode;
      return String(code).trim() === clean;
    });

    if (!match) {
      return {
        isDeliverable: false,
        text: '✕ Delivery is currently not available for this postal code.',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    const deliveryType = typeof match === 'object' && match.deliveryType ? match.deliveryType : 'standard';

    if (deliveryType === 'free') {
      return {
        isDeliverable: true,
        text: '✓ Location is deliverable • Available for FREE Express Delivery!',
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    }

    return {
      isDeliverable: true,
      text: '✓ Location is deliverable • Standard Delivery Available',
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    };
  };

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  const fetchAddresses = async () => {
    const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';
    setLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchAddresses();
    }
  }, [mounted, isAuthenticated, activeTab, token]);

  // Track Orders State
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string>('');
  const [searchTrackQuery, setSearchTrackQuery] = useState<string>('');
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);

  // Order Action Modal State (Cancel, Return, Replacement/Exchange)
  const [actionOrder, setActionOrder] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'return' | 'replace' | 'cancelReturn' | 'cancelReplace' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [proofMedia, setProofMedia] = useState<string[]>([]);
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [proofError, setProofError] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Edit Custom Photo State
  const [editingCustomPhoto, setEditingCustomPhoto] = useState<{ order: any; itemIndex: number; currentImage: string } | null>(null);
  const [newCustomPhoto, setNewCustomPhoto] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState<boolean>(false);

  // In-App Toast Popup State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveCustomPhoto = async () => {
    if (!editingCustomPhoto || !newCustomPhoto) return;
    try {
      setSavingPhoto(true);
      const targetId = editingCustomPhoto.order.orderId || editingCustomPhoto.order._id;
      const res = await axios.put(`${API_BASE_URL}/orders/${targetId}/customization`, {
        itemIndex: editingCustomPhoto.itemIndex,
        userImage: newCustomPhoto
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => (o._id === editingCustomPhoto.order._id || o.orderId === targetId) ? (res.data.data || o) : o));
        setEditingCustomPhoto(null);
        setNewCustomPhoto(null);
        showToast('Customized photo updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update custom photo.', 'error');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleOpenActionModal = (order: any, type: 'cancel' | 'return' | 'replace' | 'cancelReturn' | 'cancelReplace') => {
    const isDelivered = Boolean(order?.isDelivered || String(order?.status || '').toUpperCase() === 'DELIVERED');
    if ((type === 'return' || type === 'replace') && !isDelivered) {
      showToast('Return and Replace / Exchange options are enabled only after successful delivery of the product.', 'error');
      return;
    }
    setActionOrder(order);
    setActionType(type);
    setActionNotes('');
    setProofMedia([]);
    setProofError('');
    if (type === 'cancel') {
      setActionReason('Ordered by mistake');
    } else if (type === 'cancelReturn') {
      setActionReason('Changed mind, keep order');
    } else if (type === 'cancelReplace') {
      setActionReason('Changed mind, keep order');
    } else if (type === 'return') {
      setActionReason('Damaged / Defective item');
    } else {
      setActionReason('Need a different size');
    }
  };

  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingProof(true);
    setProofError('');

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';
        const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authToken}` 
          }
        });
        if (res.data.success && res.data.url) {
          newUrls.push(res.data.url);
        }
      } catch (uploadErr) {
        console.warn('File upload fallback:', uploadErr);
        const blobUrl = URL.createObjectURL(file);
        newUrls.push(blobUrl);
      }
    }

    setProofMedia(prev => [...prev, ...newUrls]);
    setUploadingProof(false);
  };

  const handleRemoveProofMedia = (index: number) => {
    setProofMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmOrderAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionOrder || !actionType) return;

    const isDelivered = Boolean(actionOrder?.isDelivered || String(actionOrder?.status || '').toUpperCase() === 'DELIVERED');
    if ((actionType === 'return' || actionType === 'replace') && !isDelivered) {
      setProofError('Return or Replacement can only be requested after the product has been successfully delivered.');
      return;
    }

    if ((actionType === 'return' || actionType === 'replace') && proofMedia.length === 0) {
      setProofError('Attaching at least 1 photo or video proof is mandatory for return or replacement requests.');
      return;
    }

    setSubmittingAction(true);
    setProofError('');

    let newStatus = 'CANCELLED';
    if (actionType === 'return') newStatus = 'RETURN_REQUESTED';
    if (actionType === 'replace') newStatus = 'REPLACEMENT_REQUESTED';
    if (actionType === 'cancelReturn' || actionType === 'cancelReplace') newStatus = 'Delivered';

    try {
      const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';
      const orderId = actionOrder._id || actionOrder.orderId;
      const res = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus,
        reason: actionReason,
        notes: actionNotes,
        proofMedia: proofMedia
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (res.data.success) {
        setOrders(prev => prev.map(o => (o._id === actionOrder._id || o.orderId === actionOrder.orderId) ? { 
          ...o, 
          status: newStatus,
          proofMedia: proofMedia,
          actionReason: actionReason,
          actionNotes: actionNotes
        } : o));
        setActionSuccessMsg(`Order successfully updated to ${newStatus.replace('_', ' ')}.`);
        setTimeout(() => setActionSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Failed to submit order action', err);
      setOrders(prev => prev.map(o => (o._id === actionOrder._id || o.orderId === actionOrder.orderId) ? { 
        ...o, 
        status: newStatus,
        proofMedia: proofMedia,
        actionReason: actionReason,
        actionNotes: actionNotes
      } : o));
    } finally {
      setSubmittingAction(false);
      setActionOrder(null);
      setActionType(null);
      setProofMedia([]);
    }
  };

  useEffect(() => {
    if (mounted) {
      const fetchOrders = async () => {
        const authToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'guest-token';

        setLoadingOrders(true);
        let apiOrders: any[] = [];
        try {
          const res = await axios.get(`${API_BASE_URL}/orders/myorders`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (res.data.success && Array.isArray(res.data.data)) {
            apiOrders = res.data.data;
          }
        } catch (error) {
          console.error('Failed to fetch orders from API', error);
        } finally {
          const getClientOrderFingerprint = (o: any) => {
            const price = String(o.totalPrice || 0);
            const itemTitle = o.orderItems && o.orderItems[0] ? String(o.orderItems[0].title || '').toLowerCase().trim() : '';
            const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '';
            return `${price}_${itemTitle}_${dateStr}`;
          };

          const localPlaced = JSON.parse(localStorage.getItem('piks_placed_orders') || '[]');
          const apiOrderIds = new Set<string>();
          const apiFingerprints = new Set<string>();

          for (const o of apiOrders) {
            if (o._id) apiOrderIds.add(String(o._id).toLowerCase());
            if (o.orderId) apiOrderIds.add(String(o.orderId).toLowerCase());
            if (o.id) apiOrderIds.add(String(o.id).toLowerCase());
            if (o.mongoId) apiOrderIds.add(String(o.mongoId).toLowerCase());
            if (o.rawId) apiOrderIds.add(String(o.rawId).toLowerCase());
            const fp = getClientOrderFingerprint(o);
            if (fp.trim()) apiFingerprints.add(fp);
          }

          const combined = [...apiOrders];
          for (const lo of localPlaced) {
            const loId1 = String(lo._id || '').toLowerCase();
            const loId2 = String(lo.orderId || '').toLowerCase();
            const loId3 = String(lo.id || '').toLowerCase();
            const loFp = getClientOrderFingerprint(lo);

            const isIdDup = (loId1 && apiOrderIds.has(loId1)) || (loId2 && apiOrderIds.has(loId2)) || (loId3 && apiOrderIds.has(loId3));
            const isFpDup = loFp.trim() !== '' && apiFingerprints.has(loFp);

            if (!isIdDup && !isFpDup) {
              if (loId1) apiOrderIds.add(loId1);
              if (loId2) apiOrderIds.add(loId2);
              if (loId3) apiOrderIds.add(loId3);
              if (loFp.trim()) apiFingerprints.add(loFp);
              combined.push(lo);
            }
          }

          setOrders(combined);
          if (combined.length > 0 && !selectedTrackOrderId) {
            setSelectedTrackOrderId(combined[0]._id || combined[0].id);
          }
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [mounted, isAuthenticated, activeTab, token]);

  const handleOpenAddAddr = () => {
    setEditingAddrId(null);
    setAddrForm({
      fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setAddrFormErr('');
    setShowAddrForm(true);
  };

  const handleOpenEditAddr = (addr: any) => {
    setEditingAddrId(addr._id);
    setAddrForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country || 'India',
      isDefault: addr.isDefault || false,
    });
    setAddrFormErr('');
    setShowAddrForm(true);
  };

  const handleSaveAddr = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrFormErr('');

    // Strict 6-digit postal code validation
    const cleanPostal = addrForm.postalCode.trim();
    if (!/^\d{6}$/.test(cleanPostal)) {
      setAddrFormErr('Postal code is mandatory and must contain exactly 6 digits (e.g. 560001).');
      return;
    }

    setSavingAddr(true);
    try {
      let res;
      if (editingAddrId) {
        res = await axios.put(`${API_BASE_URL}/users/addresses/${editingAddrId}`, addrForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/users/addresses`, addrForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (res.data.success) {
        setAddresses(res.data.data);
        setShowAddrForm(false);
      }
    } catch (err: any) {
      setAddrFormErr(err.response?.data?.error || 'Failed to save address.');
    } finally {
      setSavingAddr(false);
    }
  };

  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  const handleDeleteAddr = (addr: any) => {
    const targetAddr = typeof addr === 'object' ? addr : addresses.find(a => String(a._id) === String(addr));
    if (targetAddr?.isDefault || addresses.length === 1) {
      setDeleteErrorMsg('The default address cannot be deleted until the default address is changed or another address is added.');
      return;
    }
    setDeleteErrorMsg('');
    setAddressToDelete(targetAddr._id || addr);
  };

  const confirmDeleteAddr = async (addrId: string) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/users/addresses/${addrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
      setAddressToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete address', err);
      if (err.response?.data?.error) {
        setDeleteErrorMsg(err.response.data.error);
      }
      setAddressToDelete(null);
    }
  };

  const handleSetDefaultAddr = async (addrId: string) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/users/addresses/${addrId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      {/* In-App Toast Popup Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] max-w-md w-full animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 backdrop-blur-md ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700/60 shadow-emerald-900/20' 
              : 'bg-red-950/95 text-red-100 border-red-700/60 shadow-red-900/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${toastMessage.type === 'success' ? 'bg-emerald-800/80 text-emerald-300' : 'bg-red-800/80 text-red-300'}`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  {toastMessage.type === 'success' ? 'Success' : 'Notice'}
                </p>
                <p className="text-xs font-semibold text-white mt-0.5">{toastMessage.text}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <div className="container mx-auto px-6 pt-3 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-4xl font-medium tracking-tight mb-2">Welcome back, {user?.firstName || user?.name || 'User'}</h1>
          <p className="text-stone-500">Manage your account, delivery addresses, view orders, and save your favorite frames.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-sm sticky top-24">
              <nav className="flex flex-col space-y-1">
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'account' ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                  <User className="w-5 h-5" /> Account Details
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'addresses' ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                  <MapPin className="w-5 h-5" /> Delivery Addresses
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                  <Package className="w-5 h-5" /> Order History
                </button>
                <button 
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'saved' ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                  <Heart className="w-5 h-5" /> Saved Frames
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                  <Settings className="w-5 h-5" /> Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-medium mb-6">Account Details</h2>
                
                {profileMsg && (
                  <div className={`mb-6 p-4 rounded-xl text-sm border ${profileMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {profileMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div>
                    <label className="block text-sm text-stone-500 mb-2">Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all" 
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-500 mb-2">Email Address</label>
                    <input type="email" value={user?.email || ''} className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-stone-50" readOnly />
                    <p className="text-xs text-stone-400 mt-2">Email address cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-stone-500 mb-2">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all" 
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-medium">Saved Delivery Addresses</h2>
                    <p className="text-sm text-stone-500 mt-1">Manage your shipping addresses for seamless 1-click checkout.</p>
                  </div>
                  <button
                    onClick={handleOpenAddAddr}
                    className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>

                {deleteErrorMsg && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-medium">{deleteErrorMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteErrorMsg('')}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {loadingAddresses ? (
                  <div className="text-center py-12 text-stone-500">Loading saved addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                    <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No saved addresses</h3>
                    <p className="text-stone-500 mb-6 text-sm">Add a delivery address now so you won't need to re-enter it at checkout!</p>
                    <button
                      onClick={handleOpenAddAddr}
                      className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-800 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => {
                      const isDefaultOrOnly = Boolean(addr.isDefault || addresses.length === 1);
                      return (
                        <div
                          key={addr._id}
                          className={`relative p-6 rounded-2xl border transition-all ${
                            addr.isDefault
                              ? 'border-stone-900 bg-stone-50/80 shadow-sm'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                              <Check className="w-3 h-3" /> Default Address
                            </span>
                          )}
                          <h4 className="font-semibold text-stone-900 text-lg">{addr.fullName}</h4>
                          <p className="text-sm text-stone-600 mt-1">{addr.address}</p>
                          <p className="text-sm text-stone-600">{addr.city}{addr.state ? `, ${addr.state}` : ''}, <span className="font-semibold text-stone-900">{addr.postalCode}</span></p>
                          <p className="text-sm text-stone-600">{addr.country || 'India'}</p>
                          <p className="text-sm text-stone-500 mt-2 font-medium">📞 {addr.phone}</p>

                          <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddr(addr._id)}
                                className="text-stone-700 hover:text-stone-900 font-medium underline underline-offset-2"
                              >
                                Set as Default
                              </button>
                            )}
                            <div className="flex items-center gap-3 ml-auto">
                              <button
                                onClick={() => handleOpenEditAddr(addr)}
                                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
                                title="Edit Address"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddr(addr)}
                                disabled={isDefaultOrOnly}
                                className={`inline-flex items-center gap-1 font-medium p-1.5 rounded-lg transition-colors ${
                                  isDefaultOrOnly
                                    ? 'text-stone-300 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                }`}
                                title={isDefaultOrOnly ? "Default address cannot be deleted until another address is set as default or added" : "Delete Address"}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal Form for Add / Edit Address */}
            {showAddrForm && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0 mb-4">
                    <h3 className="text-xl font-bold text-stone-900">
                      {editingAddrId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddrForm(false)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {addrFormErr && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 shrink-0">
                      {addrFormErr}
                    </div>
                  )}

                  <form onSubmit={handleSaveAddr} className="flex flex-col flex-1 min-h-0">
                    <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={addrForm.fullName}
                          onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={addrForm.phone}
                          onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Street Address *</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Flat / House No., Building, Street Name"
                          value={addrForm.address}
                          onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">City *</label>
                          <input
                            type="text"
                            required
                            placeholder="Mumbai"
                            value={addrForm.city}
                            onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">State *</label>
                          <input
                            type="text"
                            required
                            placeholder="Maharashtra"
                            value={addrForm.state}
                            onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-stone-600 mb-1">Postal Code (6 digits) *</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="400001"
                            value={addrForm.postalCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setAddrForm({ ...addrForm, postalCode: val });
                            }}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm tracking-widest font-mono"
                          />
                          <p className="text-[11px] text-stone-400 mt-1">Must be exactly 6 digits.</p>
                          {(() => {
                            const info = getPincodeDeliveryInfo(addrForm.postalCode);
                            if (!info) return null;
                            return (
                              <div className={`mt-2.5 p-3 rounded-xl border text-xs font-medium ${info.bgColor} ${info.textColor} ${info.borderColor} flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200`}>
                                <span>{info.text}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Country</label>
                        <input
                          type="text"
                          value={addrForm.country}
                          onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm bg-stone-50"
                        />
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addrForm.isDefault}
                          onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                          className="w-4 h-4 text-stone-900 rounded focus:ring-stone-900"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-stone-700 cursor-pointer">
                          Set as primary default address
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 flex items-center justify-end gap-3 border-t border-stone-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowAddrForm(false)}
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingAddr}
                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50"
                      >
                        {savingAddr ? 'Saving...' : editingAddrId ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-medium mb-6">Order History</h2>
                
                {loadingOrders ? (
                  <div className="text-center py-12 text-stone-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50">
                    <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No orders yet</h3>
                    <p className="text-stone-500 mb-6 text-sm">When you place an order, it will appear here.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors">
                      Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => {
                      const statusUpper = String(order.status || '').toUpperCase();
                      const isDelivered = Boolean(
                        order.isDelivered || 
                        ['DELIVERED', 'RETURN_REQUESTED', 'RETURN_ACCEPTED', 'RETURN_REJECTED', 'REPLACEMENT_REQUESTED', 'REPLACEMENT_ACCEPTED', 'REPLACEMENT_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_ACCEPTED', 'EXCHANGE_REJECTED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'RETURNED', 'CANCEL_RETURN', 'CANCEL_REPLACEMENT'].includes(statusUpper)
                      );
                      const isReplacementOrder = Boolean(
                        statusUpper.includes('REPLACE') || 
                        statusUpper.includes('EXCHANGE') || 
                        order.expectedReplacementDate
                      );
                      return (
                      <div key={order._id} className="border border-stone-200 rounded-xl overflow-hidden">
                        <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200 flex justify-between items-center flex-wrap gap-4">
                          <div>
                            <p className="text-xs text-stone-500">Order Placed</p>
                            <p className="font-medium text-sm text-stone-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500">Total</p>
                            <p className="font-semibold text-sm text-stone-900">₹{order.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500">Order ID</p>
                            <p className="font-medium text-sm text-stone-900">{order.orderId || order._id}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              order.status === 'CANCELLED' || String(order.status || '').toUpperCase().includes('REJECT') ? 'bg-red-100 text-red-700 border border-red-200' :
                              order.status === 'RETURN_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              order.status === 'RETURNED' || order.status === 'REFUND_COMPLETED' ? 'bg-stone-200 text-stone-800 border border-stone-300' :
                              order.status === 'REPLACEMENT_REQUESTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              order.status === 'EXCHANGE_REQUESTED' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              (isReplacementOrder && (order.status === 'DELIVERED' || order.status === 'Delivered')) ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {(isReplacementOrder && (order.status === 'DELIVERED' || order.status === 'Delivered')) ? 'REPLACEMENT DELIVERED' : (order.status ? order.status.replace(/_/g, ' ') : 'CONFIRMED')}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          {order.orderItems?.map((item: any, i: number) => {
                            const productLink = item.product || item.productId ? `/shop/${item.product || item.productId}` : `/shop`;
                            return (
                              <div key={i} className="flex gap-4 mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-stone-100">
                                <Link
                                  href={productLink}
                                  className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200/60 hover:opacity-85 transition-opacity group"
                                  title={`View ${item.title}`}
                                >
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </Link>
                                <div className="flex-1">
                                  <Link
                                    href={productLink}
                                    className="font-semibold text-stone-900 hover:text-emerald-700 hover:underline transition-colors block"
                                    title={`View ${item.title}`}
                                  >
                                    {item.title}
                                  </Link>
                                  <p className="text-xs text-stone-500 mt-0.5">Size: {item.size}</p>
                                  <p className="text-xs text-stone-500">Qty: {item.quantity}</p>

                                  {item.userImage && (
                                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between flex-wrap gap-2 max-w-lg">
                                      <div className="flex items-center gap-2.5">
                                        <img src={item.userImage} alt="Customization" className="w-10 h-10 rounded-lg object-cover border border-amber-300 shadow-2xs" />
                                        <div>
                                          <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                                            <Camera className="w-3.5 h-3.5 text-amber-700" /> Customized Photo Attached
                                          </p>
                                          <p className="text-[10px] text-amber-800">Uploaded photo for custom printing</p>
                                        </div>
                                      </div>

                                      {(order.status === 'PENDING' || order.status === 'Pending' || order.status === 'CONFIRMED' || order.status === 'Confirmed' || !order.status) ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCustomPhoto({ order, itemIndex: i, currentImage: item.userImage });
                                            setNewCustomPhoto(item.userImage);
                                          }}
                                          className="px-3 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center gap-1"
                                          title="Edit customized photo before processing starts"
                                        >
                                          <Edit2 className="w-3 h-3" /> Edit Photo
                                        </button>
                                      ) : (
                                        <Link
                                          href={`/contact?orderId=${order.orderId || order._id}&subject=Photo+Change+Request`}
                                          className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center gap-1"
                                          title="Need help changing customized photo? Contact admin support"
                                        >
                                          <HelpCircle className="w-3 h-3 text-amber-400" /> Need Help?
                                        </Link>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="font-semibold text-stone-900">
                                  ₹{item.price}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Action Buttons Row */}
                        <div className="px-6 py-3.5 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            {order.status === 'CANCELLED' && (
                              <span className="text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✕ Order Cancelled
                              </span>
                            )}
                            {order.status === 'RETURN_REQUESTED' && (
                              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ↺ Return Requested
                              </span>
                            )}
                            {(order.status === 'RETURN_ACCEPTED' || order.status === 'Return Accepted') && (
                              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✓ Return Accepted & Processing
                              </span>
                            )}
                            {(order.status === 'RETURN_REJECTED' || order.status === 'Return Rejected' || order.status === 'CANCEL_RETURN') && (
                              <span className="text-red-800 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✕ Return Request Cancelled / Rejected
                              </span>
                            )}
                            {order.status === 'REPLACEMENT_REQUESTED' && (
                              <span className="text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ⇄ Replacement Requested
                              </span>
                            )}
                            {(order.status === 'REPLACEMENT_ACCEPTED' || order.status === 'Replacement Accepted') && (
                              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✓ Replacement Accepted & Processing
                              </span>
                            )}
                            {(order.status === 'DELIVERED' || order.status === 'Delivered') && isReplacementOrder && (
                              <span className="text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                ✓ Replacement Delivered Successfully
                              </span>
                            )}
                            {(order.status === 'REPLACEMENT_REJECTED' || order.status === 'Replacement Rejected' || order.status === 'CANCEL_REPLACEMENT') && (
                              <span className="text-red-800 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✕ Replacement Request Cancelled / Rejected
                              </span>
                            )}
                            {(order.status === 'EXCHANGE_ACCEPTED' || order.status === 'Exchange Accepted') && (
                              <span className="text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✓ Exchange Accepted & Processing
                              </span>
                            )}
                            {(order.status === 'EXCHANGE_REJECTED' || order.status === 'Exchange Rejected') && (
                              <span className="text-red-800 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✕ Exchange Request Cancelled / Rejected
                              </span>
                            )}
                            {(order.status === 'REFUND_INITIATED' || order.status === 'Refund Initiated') && (
                              <span className="text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                💸 Refund Initiated
                              </span>
                            )}
                            {(order.status === 'REFUND_COMPLETED' || order.status === 'Refund Completed' || order.status === 'Refund Successful' || order.status === 'RETURNED') && (
                              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                ✅ Refund Completed / Successful
                              </span>
                            )}

                            {order.adminRejectionReason && (
                              <div className="w-full mt-2 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-950">
                                <p className="font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Rejection Reason:
                                </p>
                                <p className="mt-1 text-stone-800 font-medium">{order.adminRejectionReason}</p>
                              </div>
                            )}

                            {order.expectedReplacementDate && (order.status === 'REPLACEMENT_ACCEPTED' || order.status === 'EXCHANGE_ACCEPTED' || order.status === 'Replacement Accepted') && (
                              <div className="w-full mt-2 p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950">
                                <p className="font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Truck className="w-4 h-4 text-blue-600 shrink-0" /> Expected Replacement Delivery Date:
                                  <span className="text-blue-900 font-extrabold ml-1 bg-white px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                                    {new Date(order.expectedReplacementDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-auto flex-wrap">
                            {/* Track Order / Track Return / Track Replacement Button */}
                            <button
                              type="button"
                              onClick={() => setTrackingModalOrder(order)}
                              className="px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:bg-stone-100 hover:border-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                              title="Track Status"
                            >
                              <Truck className="w-3.5 h-3.5 text-stone-600" />
                              {order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_ACCEPTED' ? 'Track Return' :
                               order.status === 'REPLACEMENT_REQUESTED' || order.status === 'EXCHANGE_REQUESTED' || order.status === 'REPLACEMENT_ACCEPTED' ? 'Track Replacement' :
                               'Track Order'}
                            </button>

                            {/* Need Help? Button */}
                            <Link
                              href="/contact"
                              className="px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:bg-stone-100 hover:border-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                              title="Contact Support & Help"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-stone-600" /> Need Help?
                            </Link>

                            {/* Cancel Order Button (Strictly for newly placed / processing orders before delivery) */}
                            {!isDelivered && 
                             statusUpper !== 'CANCELLED' && 
                             !statusUpper.includes('RETURN') && 
                             !statusUpper.includes('REPLACE') && 
                             !statusUpper.includes('EXCHANGE') && 
                             !statusUpper.includes('REFUND') && 
                             !statusUpper.includes('REJECT') && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(order, 'cancel')}
                                className="px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors flex items-center gap-1.5"
                                title="Cancel Order"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Order
                              </button>
                            )}

                            {/* Cancel Return Button (If Return Requested) */}
                            {!isReplacementOrder && (order.status === 'RETURN_REQUESTED' || order.status === 'Return Requested') && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(order, 'cancelReturn')}
                                className="px-3.5 py-1.5 rounded-full border border-red-200 text-red-700 font-semibold hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1.5"
                                title="Cancel Return Request"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Return
                              </button>
                            )}

                            {/* Return Order Button - Available only for standard Delivered orders (not replaced) */}
                            {!isReplacementOrder && isDelivered && statusUpper === 'DELIVERED' && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(order, 'return')}
                                className="px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                                title="Return Order / Product"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Return Order
                              </button>
                            )}

                            {/* Replace / Exchange Button - Available only for standard Delivered orders (not replaced) */}
                            {!isReplacementOrder && isDelivered && statusUpper === 'DELIVERED' && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(order, 'replace')}
                                className="px-3.5 py-1.5 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all shadow-xs flex items-center gap-1.5"
                                title="Request Replacement or Exchange"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Replace / Exchange
                              </button>
                            )}

                            {/* Reorder Button - Available for standard Delivered orders (not replaced) */}
                            {!isReplacementOrder && isDelivered && statusUpper === 'DELIVERED' && (
                              <button
                                type="button"
                                onClick={() => handleReorder(order)}
                                className="px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                                title="Reorder items from this order"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Reorder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'track' && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-100">
                  <div>
                    <h2 className="text-2xl font-medium">Track Your Orders</h2>
                    <p className="text-sm text-stone-500 mt-1">Live tracking and status updates for your photo frame orders.</p>
                  </div>

                  {orders.length > 0 && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-stone-700 whitespace-nowrap">Select Order:</label>
                      <select 
                        value={selectedTrackOrderId}
                        onChange={(e) => setSelectedTrackOrderId(e.target.value)}
                        className="px-4 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none bg-stone-50/50 font-medium"
                      >
                        {orders.map((o: any) => (
                          <option key={o._id} value={o._id}>
                            #{o._id} — ₹{o.totalPrice} ({new Date(o.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {loadingOrders ? (
                  <div className="text-center py-16 text-stone-500">
                    <Truck className="w-10 h-10 text-stone-400 animate-bounce mx-auto mb-3" />
                    Fetching order tracking details...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/50">
                    <Truck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No orders to track</h3>
                    <p className="text-stone-500 mb-6 text-sm">Once you place an order, live tracking details will appear here.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors">
                      Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (() => {
                  const activeOrder = orders.find(o => o._id === selectedTrackOrderId) || orders[0];
                  if (!activeOrder) return null;

                  const rawStatus = (activeOrder.status || 'Confirmed').toLowerCase();
                  let currentStep = 1;
                  if (rawStatus.includes('deliver') || rawStatus.includes('complete')) currentStep = 4;
                  else if (rawStatus.includes('ship') || rawStatus.includes('out') || rawStatus.includes('dispatch')) currentStep = 3;
                  else if (rawStatus.includes('process') || rawStatus.includes('frame') || rawStatus.includes('craft')) currentStep = 2;

                  const orderDate = new Date(activeOrder.createdAt);
                  const estDelivery = new Date(orderDate);
                  estDelivery.setDate(estDelivery.getDate() + 5);

                  return (
                    <div className="space-y-8">
                      {/* Active Order Card Header */}
                      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-6 shadow-xl border border-stone-800 relative overflow-hidden">
                        {/* Soft subtle background glow accents */}
                        <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Tracking Order</span>
                            <span className="font-mono text-xs sm:text-sm font-semibold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/15 shadow-inner">
                              #{activeOrder._id}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 flex items-center gap-1.5 pt-0.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            Placed on {orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-3 sm:gap-5 flex-wrap">
                          <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Est. Delivery</p>
                            <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-emerald-400" />
                              {estDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="bg-emerald-500/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/20 text-center">
                            <p className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold mb-0.5">Status</p>
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              {activeOrder.status || 'Confirmed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Stepper Timeline */}
                      <div className="bg-stone-50/80 p-8 rounded-2xl border border-stone-200">
                        <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-8">Delivery Progress</h4>

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
                          {/* Connecting Progress Line (Desktop) */}
                          <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-stone-200 z-0">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                            />
                          </div>

                          {/* Step 1 */}
                          <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${currentStep >= 1 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${currentStep >= 1 ? 'text-stone-900' : 'text-stone-400'}`}>Order Placed</p>
                              <p className="text-xs text-stone-500 mt-0.5">Order received & verified</p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${currentStep >= 2 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${currentStep >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>Custom Framing</p>
                              <p className="text-xs text-stone-500 mt-0.5">Photo print & handcrafted frame</p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                              <Truck className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${currentStep >= 3 ? 'text-stone-900' : 'text-stone-400'}`}>Out for Delivery</p>
                              <p className="text-xs text-stone-500 mt-0.5">Dispatched with express courier</p>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-1/4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${currentStep >= 4 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${currentStep >= 4 ? 'text-stone-900' : 'text-stone-400'}`}>Delivered</p>
                              <p className="text-xs text-stone-500 mt-0.5">Package safely delivered</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items & Shipping Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 border border-stone-200 rounded-2xl p-6 bg-white">
                          <h4 className="font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                            <Package className="w-5 h-5 text-stone-700" /> Package Contents ({activeOrder.orderItems?.length || 0} items)
                          </h4>
                          <div className="space-y-4">
                            {activeOrder.orderItems?.map((item: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center">
                                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-stone-800 text-sm">{item.title}</h5>
                                  <p className="text-xs text-stone-500">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-stone-900 text-sm">₹{item.price * item.quantity}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50/50">
                          <h4 className="font-bold text-stone-900 mb-4 pb-3 border-b border-stone-200 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-stone-700" /> Delivery Address
                          </h4>
                          {activeOrder.shippingAddress ? (
                            <div className="text-sm text-stone-600 space-y-1">
                              <p className="font-semibold text-stone-800">{activeOrder.shippingAddress.fullName || user?.name || user?.firstName}</p>
                              <p>{activeOrder.shippingAddress.address}</p>
                              <p>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.postalCode}</p>
                              <p className="pt-2 text-xs text-stone-500 font-mono">Contact: {activeOrder.shippingAddress.phone || user?.phone || 'N/A'}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-stone-500">Standard Delivery to Registered Address</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-medium mb-6">Saved Frames</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Empty state for saved items */}
                  <div className="col-span-full text-center py-12 border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50">
                    <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No saved items</h3>
                    <p className="text-stone-500 mb-6 text-sm">Save items you love to quickly find them later.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-medium mb-6">Settings</h2>
                
                {/* Security & Password Section */}
                <div className="mb-10 pb-8 border-b border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">Security & Password</h3>
                      <p className="text-sm text-stone-500">Manage your password and security credentials.</p>
                    </div>
                    {!showChangePwForm && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePwForm(true);
                          setPwMsg({ text: '', type: '' });
                        }}
                        className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-all self-start sm:self-auto"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {showChangePwForm && (
                    <form onSubmit={handleChangePassword} className="mt-6 bg-stone-50/70 p-6 rounded-2xl border border-stone-200 animate-in fade-in duration-200">
                      {pwMsg.text && (
                        <div className={`mb-6 p-4 rounded-xl text-sm border ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                          {pwMsg.text}
                        </div>
                      )}

                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Current Password</label>
                          <input 
                            type="password" 
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                          <input 
                            type="password" 
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Confirm New Password</label>
                          <input 
                            type="password" 
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button 
                            type="submit" 
                            disabled={updatingPw}
                            className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-all disabled:opacity-50"
                          >
                            {updatingPw ? 'Updating Password...' : 'Update Password'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              setShowChangePwForm(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setPwMsg({ text: '', type: '' });
                            }}
                            className="px-5 py-2.5 border border-stone-300 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-stone-100">
                    <div>
                      <h3 className="font-medium text-stone-900">Email Notifications</h3>
                      <p className="text-sm text-stone-500">Receive updates about your orders and exclusive offers.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-stone-100">
                    <div>
                      <h3 className="font-medium text-stone-900">SMS Alerts</h3>
                      <p className="text-sm text-stone-500">Get text messages when your order is out for delivery.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="text-red-500 font-medium hover:underline text-sm">
                      Delete Account
                    </button>
                    <p className="text-xs text-stone-400 mt-1">This action cannot be undone and will erase all your data.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Delete Modal */}
            {addressToDelete && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 max-w-md w-full my-auto relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar relative">
                    <button
                      type="button"
                      onClick={() => setAddressToDelete(null)}
                      className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4 mb-6 pr-8">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">Delete Address</h3>
                        <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
                          Are you sure you want to delete this delivery address? This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setAddressToDelete(null)}
                        className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteAddr(addressToDelete)}
                        className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-md shadow-red-600/10"
                      >
                        Delete Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Order Action Modal (Cancel, Return, Replacement/Exchange) */}
            {actionOrder && actionType && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 max-w-lg w-full my-auto relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto custom-scrollbar relative">
                    <button
                      type="button"
                      onClick={() => { setActionOrder(null); setActionType(null); }}
                      className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>

                  <div className="flex items-start gap-4 mb-6 pr-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      actionType === 'cancel' || actionType === 'cancelReturn' || actionType === 'cancelReplace' ? 'bg-red-50 text-red-600 border-red-100' :
                      actionType === 'return' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-stone-100 text-stone-900 border-stone-200'
                    }`}>
                      {(actionType === 'cancel' || actionType === 'cancelReturn' || actionType === 'cancelReplace') && <XCircle className="w-6 h-6" />}
                      {actionType === 'return' && <RotateCcw className="w-6 h-6" />}
                      {actionType === 'replace' && <RefreshCw className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">
                        {actionType === 'cancelReturn' ? 'Cancel Return Request' :
                         actionType === 'cancelReplace' ? 'Cancel Replacement / Exchange Request' :
                         actionType === 'cancel' ? 'Cancel Order' :
                         actionType === 'return' ? 'Return Order / Product' :
                         'Request Replacement or Exchange'}
                      </h3>
                      <p className="text-stone-500 text-xs mt-1">
                        Order ID: <span className="font-semibold text-stone-800">{actionOrder.orderId || actionOrder._id}</span> • Total: ₹{actionOrder.totalPrice}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmOrderAction} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Select Reason *
                      </label>
                      <select
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm bg-stone-50/50 font-medium text-stone-800"
                        required
                      >
                        {(actionType === 'cancelReturn' || actionType === 'cancelReplace') && (
                          <>
                            <option value="Changed mind, keep order">Changed mind, keep product as is</option>
                            <option value="Issue resolved">Issue resolved</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                        {actionType === 'cancel' && (
                          <>
                            <option value="Ordered by mistake">Ordered by mistake</option>
                            <option value="Want to change shipping address">Want to change shipping address</option>
                            <option value="Found better price elsewhere">Found better price elsewhere</option>
                            <option value="Delivery takes too long">Delivery takes too long</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                        {actionType === 'return' && (
                          <>
                            <option value="Damaged / Defective item">Damaged / Defective item</option>
                            <option value="Wrong item or size received">Wrong item or size received</option>
                            <option value="Quality not as expected">Quality not as expected</option>
                            <option value="Item missing from package">Item missing from package</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                        {actionType === 'replace' && (
                          <>
                            <option value="Need a different size">Need a different size</option>
                            <option value="Broken frame / damaged acrylic">Broken frame / damaged acrylic</option>
                            <option value="Want a different frame style/color">Want a different frame style/color</option>
                            <option value="Defective component">Defective component</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                      </select>
                    </div>

                    {(actionType === 'return' || actionType === 'replace') && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-stone-900">
                            Attach Photo / Video Proof <span className="text-red-600 font-bold">* (Mandatory)</span>
                          </label>
                          <span className="text-[11px] text-stone-500 font-medium">Photos or Short Videos</span>
                        </div>

                        {proofError && (
                          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{proofError}</span>
                          </div>
                        )}

                        <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 bg-stone-50/70 hover:bg-stone-50 hover:border-stone-400 transition-colors text-center">
                          <input
                            type="file"
                            id="proof-media-upload"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleProofFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="proof-media-upload" className="cursor-pointer flex flex-col items-center justify-center py-2">
                            <div className="w-10 h-10 rounded-full bg-stone-200/70 text-stone-700 flex items-center justify-center mb-2">
                              <Camera className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-stone-800">
                              {uploadingProof ? 'Uploading file...' : 'Click to Upload Photo or Video Proof'}
                            </p>
                            <p className="text-[11px] text-stone-500 mt-0.5">Supports PNG, JPG, MP4, MOV (Max 50MB)</p>
                          </label>
                        </div>

                        {proofMedia.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            {proofMedia.map((url, idx) => {
                              const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.startsWith('data:video');
                              return (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square">
                                  {isVideo ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-white text-xs p-1">
                                      <span className="text-[10px] font-bold text-amber-400">VIDEO</span>
                                    </div>
                                  ) : (
                                    <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProofMedia(idx)}
                                    className="absolute top-1 right-1 bg-stone-900/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Remove Media"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[11px] text-stone-400">
                          🔒 Uploaded proof will be securely reviewed by our team to process your {actionType === 'return' ? 'return' : 'replacement'} request.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Additional Details / Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder={
                          actionType === 'cancel' ? 'Let us know why you are cancelling...' :
                          actionType === 'return' ? 'Please describe the issue with the returned item...' :
                          'Specify the replacement frame size, color, or details...'
                        }
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => { setActionOrder(null); setActionType(null); }}
                        className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAction}
                        className={`px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all shadow-md ${
                          actionType === 'cancel' || actionType === 'cancelReturn' || actionType === 'cancelReplace' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/10' :
                          actionType === 'return' ? 'bg-amber-700 hover:bg-amber-800 shadow-amber-700/10' :
                          'bg-stone-900 hover:bg-stone-800 shadow-stone-900/10'
                        }`}
                      >
                        {submittingAction ? 'Submitting...' :
                         actionType === 'cancelReturn' ? 'Confirm Cancel Return' :
                         actionType === 'cancelReplace' ? 'Confirm Cancel Replacement' :
                         actionType === 'cancel' ? 'Confirm Cancellation' :
                         actionType === 'return' ? 'Submit Return Request' :
                         'Submit Replacement Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            )}

            {/* Edit Custom Photo Modal */}
            {editingCustomPhoto && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 max-w-md w-full my-auto relative animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8">
                  <button
                    type="button"
                    onClick={() => { setEditingCustomPhoto(null); setNewCustomPhoto(null); }}
                    className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">Edit Custom Photo</h3>
                      <p className="text-xs text-stone-500 mt-0.5">Editable until status changes to Processing</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Customized Photo Preview</label>
                      <div className="w-full h-44 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center relative">
                        <img 
                          src={newCustomPhoto || editingCustomPhoto.currentImage} 
                          alt="Customized preview" 
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Upload New Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setNewCustomPhoto(ev.target?.result as string);
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => { setEditingCustomPhoto(null); setNewCustomPhoto(null); }}
                        className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomPhoto}
                        disabled={savingPhoto || !newCustomPhoto}
                        className="px-6 py-2.5 rounded-full bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50"
                      >
                        {savingPhoto ? 'Saving...' : 'Save Updated Photo'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Track Order Modal */}
            {trackingModalOrder && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 max-w-xl w-full my-auto relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar relative">
                    <button
                      type="button"
                      onClick={() => setTrackingModalOrder(null)}
                      className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>

                  {(() => {
                    const rawStatus = trackingModalOrder.status || 'CONFIRMED';
                    const normStatus = String(rawStatus).toUpperCase().replace(/\s+/g, '_');

                    const isReturnTracking = normStatus.includes('RETURN') || normStatus.includes('REFUND');
                    const isReplacementTracking = Boolean(
                      normStatus.includes('REPLACE') || 
                      normStatus.includes('EXCHANGE') || 
                      trackingModalOrder.expectedReplacementDate ||
                      (trackingModalOrder.actionReason && String(trackingModalOrder.actionReason).toUpperCase().includes('REPLACE')) ||
                      (trackingModalOrder.actionReason && String(trackingModalOrder.actionReason).toUpperCase().includes('EXCHANGE'))
                    );

                    let returnStep = 1;
                    if (normStatus === 'RETURN_ACCEPTED' || normStatus === 'RETURN_APPROVED') returnStep = 2;
                    if (normStatus === 'REFUND_INITIATED') returnStep = 4;
                    if (normStatus === 'REFUND_COMPLETED' || normStatus === 'RETURNED') returnStep = 5;
                    if (normStatus === 'RETURN_REJECTED') returnStep = -1;

                    let replaceStep = 1;
                    if (normStatus === 'REPLACEMENT_ACCEPTED' || normStatus === 'EXCHANGE_ACCEPTED' || normStatus === 'PROCESSING') replaceStep = 2;
                    if (normStatus === 'SHIPPED' || normStatus === 'OUT_FOR_DELIVERY' || normStatus === 'OUT_FOR_DELIVER') replaceStep = 3;
                    if (normStatus === 'DELIVERED') replaceStep = 4;
                    if (normStatus === 'REPLACEMENT_REJECTED' || normStatus === 'EXCHANGE_REJECTED' || normStatus === 'CANCEL_REPLACEMENT') replaceStep = -1;

                    let step = 1;
                    if (normStatus === 'PROCESSING') step = 2;
                    if (normStatus === 'SHIPPED') step = 3;
                    if (normStatus === 'OUT_FOR_DELIVERY' || normStatus === 'OUT_FOR_DELIVER') step = 4;
                    if (normStatus === 'DELIVERED') step = 5;
                    if (normStatus === 'CANCELLED') step = 0;

                    return (
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isReturnTracking ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isReplacementTracking ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-stone-100 text-stone-900 border-stone-200'
                          }`}>
                            {isReturnTracking ? <RotateCcw className="w-6 h-6" /> :
                             isReplacementTracking ? <RefreshCw className="w-6 h-6" /> :
                             <Truck className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-900">
                              {isReturnTracking ? 'Track Return & Refund' :
                               isReplacementTracking ? 'Track Replacement & Exchange' :
                               'Track Order'}
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5">
                              Order ID: <span className="font-mono font-semibold text-stone-800">{trackingModalOrder.orderId || trackingModalOrder._id}</span> • {new Date(trackingModalOrder.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Status Header Box */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between flex-wrap gap-4 mb-6">
                          <div>
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Current Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                normStatus === 'CANCELLED' || normStatus.includes('REJECT') ? 'bg-red-100 text-red-700 border border-red-200' :
                                normStatus === 'DELIVERED' || normStatus.includes('COMPLETED') || normStatus === 'RETURNED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                normStatus.includes('ACCEPT') || normStatus.includes('INITIATED') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {rawStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                              {isReturnTracking ? (normStatus === 'REFUND_COMPLETED' || normStatus === 'RETURNED' ? 'Refund Completed Date' : 'Expected Refund Date') :
                               isReplacementTracking ? 'Expected Replacement Date' :
                               (normStatus === 'DELIVERED' ? 'Delivered Date' : 'Expected Delivery Date')}
                            </p>
                            <p className="text-sm font-bold text-emerald-900 mt-0.5">
                              {(() => {
                                if (normStatus === 'CANCELLED') return 'Order Cancelled';
                                if (normStatus.includes('REJECT')) return 'Request Not Accepted';
                                if (isReplacementTracking && trackingModalOrder.expectedReplacementDate) {
                                  const customExp = new Date(trackingModalOrder.expectedReplacementDate);
                                  if (!isNaN(customExp.getTime())) {
                                    return customExp.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                                  }
                                  return trackingModalOrder.expectedReplacementDate;
                                }
                                const created = trackingModalOrder.createdAt ? new Date(trackingModalOrder.createdAt) : new Date();
                                const expDate = new Date(created.getTime() + 4 * 24 * 60 * 60 * 1000);
                                return expDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Dynamic Timeline per Situation */}
                        {isReturnTracking ? (
                          /* Return & Refund Timeline */
                          <div className="relative pl-8 border-l-2 border-stone-200 space-y-7 my-6 ml-3">
                            <div className="relative">
                              <div className="absolute -left-[45px] top-0 w-7 h-7">
                                <div className="relative w-7 h-7 rounded-full bg-amber-600 text-white ring-4 ring-amber-100 shadow-sm flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <p className="text-xs font-bold text-stone-900">Return Requested</p>
                              <p className="text-[11px] text-stone-500 mt-0.5">Customer submitted return request with proof media</p>
                            </div>

                            <div className="relative">
                              <div className="absolute -left-[45px] top-0 w-7 h-7">
                                {returnStep === -1 ? (
                                  <div className="relative w-7 h-7 rounded-full bg-red-600 text-white ring-4 ring-red-100 shadow-sm flex items-center justify-center">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    returnStep >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                              {returnStep === -1 ? (
                                <div>
                                  <p className="text-xs font-bold text-red-700">Return Request Cancelled / Rejected</p>
                                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                                    {trackingModalOrder.adminRejectionReason || 'Request not accepted by admin.'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className={`text-xs font-bold ${returnStep >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>
                                    {returnStep >= 2 ? 'Return Request Approved' : 'Return Request Under Review'}
                                  </p>
                                  <p className="text-[11px] text-stone-500 mt-0.5">Admin reviews proof media & authorizes return</p>
                                </div>
                              )}
                            </div>

                            {returnStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    returnStep >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${returnStep >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>Return Pickup Scheduled</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Courier executive collects return package from address</p>
                              </div>
                            )}

                            {returnStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    returnStep >= 4 ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${returnStep >= 4 ? 'text-stone-900' : 'text-stone-400'}`}>Refund Initiated</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Refund processed to original payment source</p>
                              </div>
                            )}

                            {returnStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    returnStep >= 5 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${returnStep >= 5 ? 'text-stone-900' : 'text-stone-400'}`}>Refund Completed / Successful</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Refund amount credited to customer account</p>
                              </div>
                            )}
                          </div>
                        ) : isReplacementTracking ? (
                          /* Replacement Timeline */
                          <div className="relative pl-8 border-l-2 border-stone-200 space-y-7 my-6 ml-3">
                            <div className="relative">
                              <div className="absolute -left-[45px] top-0 w-7 h-7">
                                <div className="relative w-7 h-7 rounded-full bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm flex items-center justify-center">
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <p className="text-xs font-bold text-stone-900">Replacement Requested</p>
                              <p className="text-[11px] text-stone-500 mt-0.5">Replacement request submitted for size or product exchange</p>
                            </div>

                            <div className="relative">
                              <div className="absolute -left-[45px] top-0 w-7 h-7">
                                {replaceStep === -1 ? (
                                  <div className="relative w-7 h-7 rounded-full bg-red-600 text-white ring-4 ring-red-100 shadow-sm flex items-center justify-center">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    replaceStep >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                              {replaceStep === -1 ? (
                                <div>
                                  <p className="text-xs font-bold text-red-700">Replacement Request Cancelled / Rejected</p>
                                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                                    {trackingModalOrder.adminRejectionReason || 'Request not accepted by admin.'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className={`text-xs font-bold ${replaceStep >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>
                                    {replaceStep >= 2 ? 'Replacement Approved' : 'Replacement Under Review'}
                                  </p>
                                  <p className="text-[11px] text-stone-500 mt-0.5">Admin authorized product exchange & new item preparation</p>
                                </div>
                              )}
                            </div>

                            {replaceStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    replaceStep >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Box className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${replaceStep >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>Original Item Pickup & Verification</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Courier collects original item for exchange verification</p>
                              </div>
                            )}

                            {replaceStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    replaceStep >= 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${replaceStep >= 3 ? 'text-stone-900' : 'text-stone-400'}`}>Replacement Item Dispatched</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">New replacement product packaged & handed to courier</p>
                              </div>
                            )}

                            {replaceStep !== -1 && (
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    replaceStep >= 4 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Home className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${replaceStep >= 4 ? 'text-stone-900' : 'text-stone-400'}`}>Replacement Delivered</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">New replacement item safely delivered to customer</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Standard Order Timeline */
                          normStatus === 'CANCELLED' ? (
                            <div className="relative pl-8 border-l-2 border-red-200 space-y-7 my-6 ml-3">
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className="relative w-7 h-7 rounded-full bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-stone-900">Order Placed & Confirmed</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">{new Date(trackingModalOrder.createdAt).toLocaleString()}</p>
                              </div>

                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className="relative w-7 h-7 rounded-full bg-red-600 text-white ring-4 ring-red-100 shadow-sm flex items-center justify-center">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-red-700">Order Cancelled</p>
                                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                                  Cancelled on: {new Date(trackingModalOrder.cancelledAt || trackingModalOrder.updatedAt || trackingModalOrder.actionRequestedAt || trackingModalOrder.createdAt).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-red-600 font-medium mt-0.5">
                                  Reason: {trackingModalOrder.actionReason || trackingModalOrder.reason || 'Ordered by mistake'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative pl-8 border-l-2 border-stone-200 space-y-7 my-6 ml-3">
                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className="relative w-7 h-7 rounded-full bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-stone-900">Order Placed & Confirmed</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">{new Date(trackingModalOrder.createdAt).toLocaleString()}</p>
                              </div>

                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    step >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Printer className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${step >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>Printing & Framing in Progress</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Handcrafted in our specialized workshop</p>
                              </div>

                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    step >= 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Box className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${step >= 3 ? 'text-stone-900' : 'text-stone-400'}`}>Shipped</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Dispatched & handed over to logistics courier</p>
                              </div>

                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    step >= 4 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${step >= 4 ? 'text-stone-900' : 'text-stone-400'}`}>Out for Delivery</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Courier executive is delivering package today</p>
                              </div>

                              <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-7 h-7">
                                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    step >= 5 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}>
                                    <Home className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className={`text-xs font-bold ${step >= 5 ? 'text-stone-900' : 'text-stone-400'}`}>Delivered</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">Safely delivered to shipping address</p>
                              </div>
                            </div>
                          )
                        )}

                        {/* Order Items Preview */}
                        <div className="border-t border-stone-100 pt-4">
                          <p className="text-xs font-semibold text-stone-700 mb-2">Package Items ({trackingModalOrder.orderItems?.length || 0})</p>
                          <div className="space-y-2">
                            {trackingModalOrder.orderItems?.map((item: any, idx: number) => {
                              const productLink = item.product || item.productId ? `/shop/${item.product || item.productId}` : `/shop`;
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                                  <div className="flex items-center gap-3">
                                    <Link
                                      href={productLink}
                                      onClick={() => setTrackingModalOrder(null)}
                                      className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0 hover:opacity-85 transition-opacity"
                                      title={`View ${item.title}`}
                                    >
                                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </Link>
                                    <div>
                                      <Link
                                        href={productLink}
                                        onClick={() => setTrackingModalOrder(null)}
                                        className="font-semibold text-stone-800 hover:text-emerald-700 hover:underline transition-colors block"
                                        title={`View ${item.title}`}
                                      >
                                        {item.title}
                                      </Link>
                                      <p className="text-stone-500 text-[11px]">Size: {item.size} • Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-stone-900">₹{item.price}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setTrackingModalOrder(null)}
                            className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all"
                          >
                            Close Tracker
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
