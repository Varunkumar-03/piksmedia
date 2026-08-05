'use client';
import { API_BASE_URL } from '../../config';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, 
  Settings, LogOut, ArrowRight, Plus, Trash2, Edit2, Lock,
  CheckCircle2, XCircle, RefreshCcw, User as UserIcon, ImageIcon, MapPin, List, Search, Zap, Tag, Clock, IndianRupee, Printer, Phone, Home, Check, Star, Mail, Download, ChevronDown, ChevronUp, HelpCircle, ExternalLink, Truck, Play, Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, logout, token, login } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    if (savedTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('adminActiveTab', tabId);
  };

  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newSizeUnit, setNewSizeUnit] = useState('inches(in)');
  const [sizeToDelete, setSizeToDelete] = useState<string | null>(null);

  // Coupons & Offers State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState<any>({ code: '', discountType: 'percentage', discountValue: '', minSpend: '0', expiryDate: '', isActive: true });
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const [offers, setOffers] = useState<any[]>([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState<any>({ title: '', discountType: 'percentage', discountValue: '', category: 'all', image: '', expiryDate: '', isActive: true });
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [orderToReturn, setOrderToReturn] = useState<string | null>(null);
  const [contactRequestToDelete, setContactRequestToDelete] = useState<number | null>(null);
  const [contactRequests, setContactRequests] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('piks_contact_requests');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy mock contact requests automatically
          parsed = parsed.filter((r: any) => r && r.id !== 'CR-001' && r.id !== 'CR-002');
          setContactRequests(parsed);
          localStorage.setItem('piks_contact_requests', JSON.stringify(parsed));
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setContactRequests([]);
    localStorage.setItem('piks_contact_requests', JSON.stringify([]));
  }, []);
  const [heroImages, setHeroImages] = useState<string[]>(Array(20).fill(''));
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const [landingPageImages, setLandingPageImages] = useState({
    curation: Array(4).fill(''),
    bestSellers: Array(3).fill(''),
    community: Array(5).fill('')
  });
  const [uploadingLandingImage, setUploadingLandingImage] = useState<{section: string, index: number} | null>(null);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ authorName: '', text: '', rating: 5, verified: true, initials: '' });

  const [footerSettings, setFooterSettings] = useState<any>({
    brand: { name: '', description: '', email: '', phone: '', address: '' },
    shopLinks: [], supportLinks: [], socials: { twitter: '', instagram: '' }
  });

  const [legalSettings, setLegalSettings] = useState({
    privacyPolicy: '',
    termsOfService: '',
    privacyPolicyUpdatedAt: '',
    termsOfServiceUpdatedAt: ''
  });

  // Delivery Locations State
  const [deliveryLocations, setDeliveryLocations] = useState<any[]>([]);
  const [returnAddress, setReturnAddress] = useState({ companyName: '', addressLine1: '', addressLine2: '' });

  // Why Us Page Settings State
  const [whyUsSettings, setWhyUsSettings] = useState<any>({
    hero: { tagline: '', title: '', description: '' },
    features: [],
    showcase: { image1: '', image2: '' },
    coreValues: [],
    founder: { quote: '', description: '', name: '', role: '', image: '' }
  });
  const [uploadingWhyUsImage, setUploadingWhyUsImage] = useState<string | null>(null);

  const [navCategories, setNavCategories] = useState<string[]>(['Hand Arts', 'Paintings', 'Funeral Frames']);
  const [newNavCategory, setNewNavCategory] = useState('');

  useEffect(() => {
    const savedCats = localStorage.getItem('piks_nav_categories');
    if (savedCats) {
      try {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) {
          setNavCategories(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveNavCategories = () => {
    localStorage.setItem('piks_nav_categories', JSON.stringify(navCategories));
    toast.success('Navigation categories updated!');
  };

  const [supportContent, setSupportContent] = useState<any>({
    faqs: [
      {
        category: "Orders & Shipping",
        questions: [
          {
            q: "How long will it take to receive my custom frame?",
            a: "Typically, custom frames take 3-5 business days to craft. Shipping takes an additional 2-4 days depending on your location. You will receive a tracking number once your order is on its way."
          },
          {
            q: "Do you offer international shipping?",
            a: "Currently, we only ship within the contiguous United States to ensure our frames arrive in perfect condition without exorbitant shipping costs."
          }
        ]
      },
      {
        category: "Products & Materials",
        questions: [
          {
            q: "What type of glass do you use?",
            a: "We offer three types of glazing: Standard Acrylic (lightweight and shatter-resistant), Non-Glare Acrylic, and premium Museum Glass (99% UV protection and virtually invisible)."
          },
          {
            q: "Are the frames made of real wood?",
            a: "Yes, all our wooden frames are crafted from solid wood mouldings sourced from sustainable forests."
          }
        ]
      },
      {
        category: "Returns & Exchanges",
        questions: [
          {
            q: "What if my frame arrives damaged?",
            a: "If your frame arrives damaged, please contact us within 48 hours of delivery with photos of the damage and the packaging. We will expedite a replacement to you at no additional cost."
          },
          {
            q: "Can I return a custom frame?",
            a: "Because custom frames are made specifically to your dimensions, we cannot accept returns for buyer's remorse or measurement errors. However, if we made a mistake, we will make it right."
          }
        ]
      }
    ],
    shipping: {
      processingTime: "Custom frames take 3-5 business days to craft in our workshop. Standard prints and accessories ship within 1-2 business days.",
      guarantee: "If your frame arrives damaged or with any defects, we will replace it immediately at no cost to you. Please report issues within 48 hours of delivery.",
      customOrders: "Because custom frames are cut to your exact specifications, they cannot be returned or exchanged due to buyer's remorse or measurement errors.",
      standardItems: "Non-custom items (like pre-sized frames or accessories) can be returned within 30 days of delivery. Items must be in original packaging. A 10% restocking fee applies.",
      methods: "Standard Ground: 3-5 business days (Free over ₹8,000)\nExpedited: 2 business days\nNext Day Air: 1 business day"
    },
    sizeGuide: [
      { art: '5" x 7"', mat: '1.5"', frame: '8" x 10"' },
      { art: '8" x 10"', mat: '1.5"', frame: '11" x 14"' },
      { art: '11" x 14"', mat: '2"', frame: '16" x 20"' },
      { art: '16" x 20"', mat: '2"', frame: '20" x 24"' },
      { art: '18" x 24"', mat: '2.5"', frame: '24" x 30"' },
      { art: '24" x 36"', mat: '3"', frame: '30" x 42"' }
    ]
  });

  const saveSupportContent = async () => {
    try {
      await axios.put(`${API_BASE_URL}/settings/support-content`, { content: supportContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Support pages content saved to database!');
    } catch (err) {
      toast.error('Failed to save support pages content');
    }
  };

  const [openSupportSection, setOpenSupportSection] = useState<string | null>('faqs');


  // Image Compression Utility for Fast Uploads & Saving
  const compressImageDataUrl = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };
  type Pincode = { code: string; type: 'standard' | 'free' | 'sameday' };
  const [activePincodes, setActivePincodes] = useState<Pincode[]>([]);
  const [standardPincodes, setStandardPincodes] = useState('');
  const [freePincodes, setFreePincodes] = useState('');
  const [sameDayPincodes, setSameDayPincodes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewerStats, setViewerStats] = useState<any>(null);
  const [loadingViewerStats, setLoadingViewerStats] = useState(false);

  // Form states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<any>({
    title: '', description: '', price: '', image: '', category: '', stock: '', returnDays: false, replacementDays: false, policyText: '', mockup: false, deliveryCharges: '', freeShippingThreshold: '', gallery: [], mockupImage: '', hasSizeChart: false, variants: [], tag: ''
  });

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<any>({ 
    name: '', description: '', image: '', badge: '', availableSizes: '', sizeUnit: 'inches(in)' 
  });
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '', lastName: '', email: '', password: ''
  });

  // Reviews Admin States
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [adminMediaPreview, setAdminMediaPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || ''
  });

  // Password Change State for Admin
  const [showAdminChangePw, setShowAdminChangePw] = useState(false);
  const [adminCurrentPw, setAdminCurrentPw] = useState('');
  const [adminNewPw, setAdminNewPw] = useState('');
  const [adminConfirmPw, setAdminConfirmPw] = useState('');
  const [adminPwMsg, setAdminPwMsg] = useState({ text: '', type: '' });
  const [updatingAdminPw, setUpdatingAdminPw] = useState(false);

  // Update profile data when user is loaded
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (mounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, mounted, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [uRes, oRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } })),
          axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } }))
        ]);
        const fetchedOrders = oRes.data?.data || [];
        const revenue = Array.isArray(fetchedOrders) ? fetchedOrders.reduce((acc: number, cur: any) => acc + (cur.totalPrice || 0), 0) : 0;
        setOrders(fetchedOrders);
        setStats({
          totalUsers: Array.isArray(uRes.data?.data) ? uRes.data.data.length : 0,
          totalOrders: Array.isArray(fetchedOrders) ? fetchedOrders.length : 0,
          totalRevenue: revenue
        });
      } else if (activeTab === 'products') {
        const [pRes, cRes, sRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/catalog/products`, { validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } })),
          axios.get(`${API_BASE_URL}/categories`, { validateStatus: () => true }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/sizes`, { validateStatus: () => true }).catch(() => ({ data: [] }))
        ]);
        setProducts(Array.isArray(pRes.data?.data) ? pRes.data.data : (Array.isArray(pRes.data) ? pRes.data : []));
        setCategories(Array.isArray(cRes.data) ? cRes.data : (Array.isArray(cRes.data?.data) ? cRes.data.data : []));
        setSizes(Array.isArray(sRes.data) ? sRes.data : (Array.isArray(sRes.data?.data) ? sRes.data.data : []));
      } else if (activeTab === 'categories') {
        const [cRes, sRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`, { validateStatus: () => true }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/sizes`, { validateStatus: () => true }).catch(() => ({ data: [] }))
        ]);
        setCategories(Array.isArray(cRes.data) ? cRes.data : (Array.isArray(cRes.data?.data) ? cRes.data.data : []));
        setSizes(Array.isArray(sRes.data) ? sRes.data : (Array.isArray(sRes.data?.data) ? sRes.data.data : []));
      } else if (activeTab === 'coupons') {
        const [cpRes, ofRes, cRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/settings/coupons`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/settings/offers`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/categories`, { validateStatus: () => true }).catch(() => ({ data: [] }))
        ]);
        setCoupons(Array.isArray(cpRes.data?.data) ? cpRes.data.data : (Array.isArray(cpRes.data) ? cpRes.data : []));
        setOffers(Array.isArray(ofRes.data?.data) ? ofRes.data.data : (Array.isArray(ofRes.data) ? ofRes.data : []));
        setCategories(Array.isArray(cRes.data) ? cRes.data : (Array.isArray(cRes.data?.data) ? cRes.data.data : []));
      } else if (activeTab === 'orders' || activeTab === 'returns') {
        const [oRes, pRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } })),
          axios.get(`${API_BASE_URL}/catalog/products`, { validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } }))
        ]);
        setOrders(Array.isArray(oRes.data?.data) ? oRes.data.data : []);
        setProducts(Array.isArray(pRes.data?.data) ? pRes.data.data : []);
      } else if (activeTab === 'users') {
        const res = await axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }).catch(() => ({ data: { success: true, data: [] } }));
        setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (activeTab === 'reviews') {
        const res = await axios.get(`${API_BASE_URL}/reviews/admin${reviewFilter !== 'ALL' ? `?status=${reviewFilter}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true
        }).catch(() => ({ data: { success: true, data: [] } }));
        setAdminReviews(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (activeTab === 'hero') {
        const res = await axios.get(`${API_BASE_URL}/settings/hero-images`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } }));
        if (res.data?.data) {
          setHeroImages(res.data.data);
        }
      } else if (activeTab === 'landing') {
        const res = await axios.get(`${API_BASE_URL}/settings/landing-page-images`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } }));
        if (res.data?.data) {
          setLandingPageImages(res.data.data);
        }
      } else if (activeTab === 'testimonials') {
        const res = await axios.get(`${API_BASE_URL}/settings/testimonials`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } }));
        if (res.data?.data) {
          setTestimonials(res.data.data);
        }
      } else if (activeTab === 'footer') {
        const res = await axios.get(`${API_BASE_URL}/settings/footer`, { validateStatus: () => true }).catch(() => ({ data: { data: null } }));
        if (res.data?.data) {
          setFooterSettings(res.data.data);
        }
      } else if (activeTab === 'legal') {
        const res = await axios.get(`${API_BASE_URL}/settings/legal`, { validateStatus: () => true }).catch(() => ({ data: { data: null } }));
        if (res.data?.data) {
          setLegalSettings(res.data.data);
        }
      } else if (activeTab === 'delivery') {
        const res = await axios.get(`${API_BASE_URL}/settings/delivery-locations`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } }));
        if (res.data?.data) {
          setDeliveryLocations(res.data.data);
          syncActivePincodes(res.data.data);
        }
        const resAddr = await axios.get(`${API_BASE_URL}/settings/shipping-return-address`, { validateStatus: () => true }).catch(() => ({ data: { data: null } }));
        if (resAddr.data?.data) {
          setReturnAddress(resAddr.data.data);
        }
      } else if (activeTab === 'why-us') {
        const res = await axios.get(`${API_BASE_URL}/settings/why-us`, { validateStatus: () => true }).catch(() => ({ data: { data: [] } }));
        if (res.data?.data) {
          setWhyUsSettings(res.data.data);
        }
      } else if (activeTab === 'support-pages') {
        const res = await axios.get(`${API_BASE_URL}/settings/support-content`, { validateStatus: () => true }).catch(() => ({ data: { data: null } }));
        if (res.data?.data) {
          setSupportContent(res.data.data);
        } else {
          const saved = localStorage.getItem('piks_support_content');
          if (saved) {
            const parsed = JSON.parse(saved);
            setSupportContent((prev: any) => ({
              ...prev,
              ...parsed,
              sizeGuide: parsed.sizeGuide || prev.sizeGuide
            }));
          }
        }
      } else if (activeTab === 'viewers') {
        setLoadingViewerStats(true);
        const res = await axios.get(`${API_BASE_URL}/visitors/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: null } }));
        if (res.data?.data) {
          setViewerStats(res.data.data);
        }
        setLoadingViewerStats(false);
      }
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, reviewFilter]);

  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
      fetchData();
    }
  }, [mounted, isAuthenticated, user, activeTab, reviewFilter, fetchData]);

  const handleUpdateReviewStatus = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await axios.put(`${API_BASE_URL}/reviews/${reviewId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Review ${status === 'APPROVED' ? 'Approved' : 'Rejected'}!`);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review status.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review permanently?')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Review deleted permanently.');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review.');
    }
  };
  const handleUpdatePrivacyPolicy = async () => {
    try {
      const updatedLegal = { 
        ...legalSettings, 
        privacyPolicyUpdatedAt: new Date().toISOString() 
      };
      await axios.put(`${API_BASE_URL}/settings/legal`, { legal: updatedLegal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLegalSettings(updatedLegal);
      toast.success('Privacy Policy updated successfully!');
    } catch (error) {
      console.error('Error updating privacy policy', error);
      toast.error('Failed to update privacy policy');
    }
  };

  const handleUpdateTermsOfService = async () => {
    try {
      const updatedLegal = { 
        ...legalSettings, 
        termsOfServiceUpdatedAt: new Date().toISOString() 
      };
      await axios.put(`${API_BASE_URL}/settings/legal`, { legal: updatedLegal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLegalSettings(updatedLegal);
      toast.success('Terms of Service updated successfully!');
    } catch (error) {
      console.error('Error updating terms of service', error);
      toast.error('Failed to update terms of service');
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedCoupons;
      if (newCoupon._id) {
        updatedCoupons = coupons.map(c => c._id === newCoupon._id ? newCoupon : c);
      } else {
        const couponWithId = { ...newCoupon, _id: Date.now().toString() };
        updatedCoupons = [...coupons, couponWithId];
      }

      await axios.put(`${API_BASE_URL}/settings/coupons`, { coupons: updatedCoupons }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(updatedCoupons);
      toast.success('Coupons updated successfully');
      setShowAddCoupon(false);
    } catch (error) {
      console.error('Error adding coupon', error);
      toast.error('Failed to add/update coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const updatedCoupons = coupons.filter(c => c._id !== id);
      await axios.put(`${API_BASE_URL}/settings/coupons`, { coupons: updatedCoupons }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(updatedCoupons);
      toast.success('Coupon deleted successfully');
      setCouponToDelete(null);
    } catch (error) {
      console.error('Error deleting coupon', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedOffers;
      if (newOffer._id) {
        updatedOffers = offers.map(o => o._id === newOffer._id ? newOffer : o);
      } else {
        const offerWithId = { ...newOffer, _id: Date.now().toString() };
        updatedOffers = [...offers, offerWithId];
      }

      await axios.put(`${API_BASE_URL}/settings/offers`, { offers: updatedOffers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(updatedOffers);
      toast.success('Offers updated successfully');
      setShowAddOffer(false);
    } catch (error) {
      console.error('Error adding offer', error);
      toast.error('Failed to add/update offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      const updatedOffers = offers.filter(o => o._id !== id);
      await axios.put(`${API_BASE_URL}/settings/offers`, { offers: updatedOffers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(updatedOffers);
      toast.success('Offer deleted successfully');
      setOfferToDelete(null);
    } catch (error) {
      console.error('Error deleting offer', error);
      toast.error('Failed to delete offer');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newCategory };
      if (typeof payload.availableSizes === 'string') {
        payload.availableSizes = payload.availableSizes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      
      let savedCat: any = null;
      if (newCategory._id) {
         const res = await axios.put(`${API_BASE_URL}/categories/${newCategory._id}`, payload, {
           headers: { Authorization: `Bearer ${token}` }
         });
         savedCat = res.data?.data || res.data;
         setCategories(prev => prev.map(c => String(c._id) === String(newCategory._id) ? { ...c, ...savedCat } : c));
      } else {
         const res = await axios.post(`${API_BASE_URL}/categories`, payload, {
           headers: { Authorization: `Bearer ${token}` }
         });
         savedCat = res.data?.data || res.data;
         setCategories(prev => {
           const exists = prev.some(c => String(c._id) === String(savedCat._id) || c.name.toLowerCase() === savedCat.name?.toLowerCase());
           if (exists) {
             return prev.map(c => (String(c._id) === String(savedCat._id) || c.name.toLowerCase() === savedCat.name?.toLowerCase()) ? { ...c, ...savedCat } : c);
           }
           return [savedCat, ...prev];
         });
      }
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '', image: '', badge: '', availableSizes: '', sizeUnit: 'inches(in)' });
      fetchData();
      toast.success('Category saved successfully');
    } catch (error) {
      console.error('Error saving category', error);
      toast.error('Failed to save category');
    }
  };

  const getAdminHeaders = () => {
    const currentToken = token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null) || 'mock-admin-token';
    return { Authorization: `Bearer ${currentToken}` };
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(c => String(c._id) !== String(id)));
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: getAdminHeaders()
      });
      fetchData();
      toast.success('Category deleted');
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category', error);
      toast.error('Failed to delete category');
      setCategoryToDelete(null);
    }
  };

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/sizes`, { name: newSize, unit: newSizeUnit }, {
        headers: getAdminHeaders()
      });
      const createdSize = res.data?.data || res.data;
      setSizes([createdSize, ...sizes]);
      setShowAddSize(false);
      setNewSize('');
      setNewSizeUnit('inches(in)');
      toast.success('Size added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error adding size');
    }
  };

  const handleDeleteSize = async (id: string) => {
    try {
      setSizes(prev => prev.filter(s => String(s._id) !== String(id)));
      await axios.delete(`${API_BASE_URL}/sizes/${id}`, {
        headers: getAdminHeaders()
      });
      setSizeToDelete(null);
      toast.success('Size deleted');
    } catch (err: any) {
      toast.error('Error deleting size');
      setSizeToDelete(null);
    }
  };

  const [savingProduct, setSavingProduct] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProduct) return;
    setSavingProduct(true);

    try {
      let categoryPayload: any = newProduct.category;
      if (typeof newProduct.category === 'object' && newProduct.category) {
        categoryPayload = newProduct.category._id || newProduct.category.name || newProduct.category;
      }

      const payload = {
        ...newProduct,
        category: categoryPayload,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock || 10),
        deliveryCharges: Number(newProduct.deliveryCharges || 0),
        freeShippingThreshold: Number(newProduct.freeShippingThreshold || 0)
      };

      const headers = getAdminHeaders();
      const isEditing = Boolean(newProduct._id);
      const editingId = newProduct._id;
      let savedResultProduct: any = null;

      if (isEditing) {
        const res = await axios.put(`${API_BASE_URL}/catalog/products/${editingId}`, payload, { headers, timeout: 30000 });
        savedResultProduct = res.data?.data || res.data || { _id: editingId, ...payload };
        
        setProducts(prev => prev.map(p => String(p._id) === String(editingId) ? { ...p, ...savedResultProduct, _id: editingId } : p));
        toast.success('Product updated successfully');
      } else {
        const res = await axios.post(`${API_BASE_URL}/catalog/products`, payload, { headers, timeout: 30000 });
        savedResultProduct = res.data?.data || res.data;
        
        setProducts(prev => {
          const exists = prev.some(p => String(p._id) === String(savedResultProduct._id));
          if (exists) {
            return prev.map(p => String(p._id) === String(savedResultProduct._id) ? { ...p, ...savedResultProduct } : p);
          }
          return [savedResultProduct, ...prev];
        });
        toast.success('Product added successfully');
      }

      setShowAddProduct(false);
      setNewProduct({ 
        title: '', description: '', price: '', image: '', category: '', stock: '', 
        returnDays: false, replacementDays: false, policyText: '', mockup: false, 
        deliveryCharges: '', freeShippingThreshold: '', gallery: [], mockupImage: '', 
        variants: [], tag: '' 
      });
    } catch (error: any) {
      console.error('Error saving product', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = async (id: string) => {
    try {
      setProducts(prev => prev.filter(p => String(p._id) !== String(id)));
      await axios.delete(`${API_BASE_URL}/catalog/products/${id}`, {
        headers: getAdminHeaders()
      });
      fetchData();
      toast.success('Product deleted successfully');
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product', error);
      toast.error('Failed to delete product');
      setProductToDelete(null);
    }
  };

  const handleUpdateOrderStatus = async (id: string, isDelivered: boolean) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${id}/status`, { isDelivered }, {
        headers: getAdminHeaders()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating order', error);
    }
  };

  const handleUpdateOrderToReturned = (id: string) => {
    setOrderToReturn(id);
  };

  const confirmReturnOrder = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${id}/return`, {}, {
        headers: getAdminHeaders()
      });
      fetchData();
      toast.success('Order marked as returned');
      setOrderToReturn(null);
    } catch (error) {
      console.error('Error returning order', error);
      toast.error('Failed to mark order as returned');
      setOrderToReturn(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users/admin`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddAdmin(false);
      setNewAdmin({ firstName: '', lastName: '', email: '', password: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding admin', error);
      toast.error('Failed to add admin');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      login(res.data.data, token as string);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPwMsg({ text: '', type: '' });

    if (adminNewPw !== adminConfirmPw) {
      setAdminPwMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (adminNewPw.length < 6) {
      setAdminPwMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setUpdatingAdminPw(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/users/change-password`,
        { currentPassword: adminCurrentPw, newPassword: adminNewPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAdminPwMsg({ text: 'Password updated successfully!', type: 'success' });
        setAdminCurrentPw('');
        setAdminNewPw('');
        setAdminConfirmPw('');
        toast.success('Password updated successfully!');
      }
    } catch (err: any) {
      setAdminPwMsg({ text: err.response?.data?.error || 'Failed to update password.', type: 'error' });
      toast.error(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setUpdatingAdminPw(false);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProfilePhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const newUrl = res.data.url;
      setProfileData({ ...profileData, profilePhoto: newUrl });
      toast.success('Photo uploaded! Click Save Changes to update your profile.');
    } catch (error) {
      console.error('Error uploading profile photo', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  const [viewingCustomItem, setViewingCustomItem] = useState<any>(null);
  const [rejectionModalOrder, setRejectionModalOrder] = useState<{ id: string; status: string; title: string } | null>(null);
  const [adminRejectionReasonText, setAdminRejectionReasonText] = useState('');
  const [replacementModalOrder, setReplacementModalOrder] = useState<{ id: string; status: string } | null>(null);
  const [expectedReplacementDateInput, setExpectedReplacementDateInput] = useState('');

  const handleUpdateOrderStatusValue = async (id: string, status: string, customReason?: string, customExpectedDate?: string) => {
    const isRejecting = status === 'RETURN_REJECTED' || status === 'REPLACEMENT_REJECTED' || status === 'EXCHANGE_REJECTED' || status === 'CANCEL_RETURN' || status === 'CANCEL_REPLACEMENT';
    const isAcceptingReplacement = status === 'REPLACEMENT_ACCEPTED' || status === 'EXCHANGE_ACCEPTED';

    if (isRejecting && customReason === undefined) {
      const isReturn = status === 'RETURN_REJECTED' || status === 'CANCEL_RETURN';
      setRejectionModalOrder({ 
        id, 
        status, 
        title: isReturn ? 'Cancel / Reject Return Request' : 'Cancel / Reject Replacement or Exchange Request' 
      });
      setAdminRejectionReasonText('');
      return;
    }

    if (isAcceptingReplacement && customExpectedDate === undefined) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 5);
      const dateStr = defaultDate.toISOString().split('T')[0];
      setReplacementModalOrder({ id, status });
      setExpectedReplacementDateInput(dateStr);
      return;
    }

    try {
      const isDelivered = status === 'Delivered';
      await axios.put(`${API_BASE_URL}/orders/${id}/status`, { 
        isDelivered, 
        status,
        adminRejectionReason: customReason || adminRejectionReasonText || '',
        expectedReplacementDate: customExpectedDate || expectedReplacementDateInput || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      toast.success('Order status updated successfully');
      setRejectionModalOrder(null);
      setAdminRejectionReasonText('');
      setReplacementModalOrder(null);
      setExpectedReplacementDateInput('');
    } catch (error) {
      console.error('Error updating order', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const customerName = order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest');
      const email = order.user?.email || order.shippingAddress?.email || 'N/A';
      const phone = order.shippingAddress?.phone || 'N/A';
      const address = `${order.shippingAddress?.address || ''}<br/>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''} - ${order.shippingAddress?.postalCode || ''}`;
      
      const itemsHtml = (order.orderItems || []).map((item: any) => `
        <tr>
          <td>${item.title || item.size} ${item.userImage ? '<br><small style="color: #666;">(Custom Photo)</small>' : ''}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">₹${(item.price || 0).toFixed(2)}</td>
          <td style="text-align: right;">₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${order._id}</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #111; line-height: 1.5; max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 28px; font-weight: bold; letter-spacing: -0.5px; }
              .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
              .meta { text-align: right; }
              .label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; }
              .value { font-size: 14px; margin-bottom: 12px; }
              .details { display: flex; gap: 40px; margin-bottom: 40px; }
              .col { flex: 1; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; }
              td { padding: 16px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
              .totals { display: flex; justify-content: flex-end; }
              .totals-box { width: 300px; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
              .total-final { font-size: 20px; font-weight: bold; border-top: 2px solid #eee; padding-top: 12px; margin-top: 4px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; color: #111;">PREPAID</div>
                <img src="${window.location.origin}/logo.png" style="height: 40px; margin-bottom: 8px;" alt="Piks Media" />
                <div class="subtitle">Tax Invoice / Receipt</div>
              </div>
              <div class="meta">
                <div class="label">Order ID</div>
                <div class="value" style="font-family: monospace;">${order._id}</div>
                <div class="label">Order Date</div>
                <div class="value">${orderDate}</div>
              </div>
            </div>
            
            <div class="details">
              <div class="col">
                <div class="label">Customer Details</div>
                <div class="value">
                  <strong>${customerName}</strong><br/>
                  ${email}<br/>
                  Phone: ${phone}
                </div>
              </div>
              <div class="col">
                <div class="label">Shipping Address</div>
                <div class="value">${address}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="totals-box">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>₹${(order.itemsPrice || order.totalPrice || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Shipping</span>
                  <span>${order.shippingPrice ? `₹${order.shippingPrice.toFixed(2)}` : 'Free'}</span>
                </div>
                <div class="total-row total-final">
                  <span>Total</span>
                  <span>₹${(order.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Allow some time for fonts to load before triggering print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handlePrintShippingBill = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const customerName = order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest');
      const address = `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''} - ${order.shippingAddress?.postalCode || ''}`;
      const isCod = (order.paymentMethod || '').toLowerCase().includes('cod');
      const paymentTypeLabel = isCod ? 'COD (Postpaid)' : 'Prepaid';
      
      const deliverySheetUrl = `${window.location.origin}/delivery-sheet/${order._id}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(deliverySheetUrl)}`;
      const skuInfo = (order.orderItems && order.orderItems[0]) ? `${order.orderItems[0].title || 'Product'}-${order.orderItems[0].size || 'Free'}` : 'MTS-3007-Black-XL';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Shipping Bill - ${order._id}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #fff;
                color: #000;
              }
              .label-container {
                max-width: 580px;
                margin: 0 auto;
                border: 2px solid #000;
                box-sizing: border-box;
              }
              .section {
                border-bottom: 2px solid #000;
                padding: 12px 16px;
              }
              .section:last-child {
                border-bottom: none;
              }
              .flex-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .routing-col {
                flex: 1.2;
              }
              .payment-col {
                flex: 0.8;
                text-align: right;
              }
              .logistics-title {
                font-size: 20px;
                font-weight: 800;
                text-transform: lowercase;
                letter-spacing: -0.5px;
                margin: 0 0 4px 0;
              }
              .route-large {
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 4px 0;
              }
              .postal-route {
                font-size: 15px;
                font-weight: 600;
                margin: 0;
              }
              .payment-bold {
                font-size: 14px;
                font-weight: 700;
                margin: 0 0 2px 0;
              }
              .payment-sub {
                font-size: 12px;
                color: #444;
                margin: 0;
              }
              .buyer-title {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #666;
                margin: 0 0 6px 0;
                font-weight: 600;
              }
              .buyer-name {
                font-size: 18px;
                font-weight: 800;
                margin: 0 0 6px 0;
              }
              .buyer-address {
                font-size: 14px;
                line-height: 1.4;
                margin: 0;
              }
              .undelivered-box {
                width: 70%;
                border-top: 1.5px solid #000;
                margin-top: 16px;
                padding-top: 8px;
              }
              .seller-details {
                margin-top: 12px;
                font-size: 10px;
                color: #333;
                line-height: 1.3;
              }
              .bottom-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                font-size: 11px;
              }
              .declaration {
                max-width: 65%;
                line-height: 1.3;
                color: #444;
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              <div class="section flex-row" style="align-items: center;">
                <div class="routing-col">
                  <img src="${window.location.origin}/logo.png" style="height: 55px; max-width: 220px; object-fit: contain; display: block;" alt="Piks Logo" />
                </div>
                <div class="payment-col">
                  <div class="payment-bold">${isCod ? 'Collect Cash (COD)' : 'Prepaid (No amount)'}</div>
                  <div class="payment-bold" style="font-size: 16px; margin-top: 4px;">₹${isCod ? order.totalPrice?.toFixed(2) : '0.0'}</div>
                </div>
              </div>

              <div class="section flex-row" style="position: relative;">
                <div style="flex: 1.3; padding-right: 16px;">
                  <div class="buyer-title">Buyer's Name And Address</div>
                  <div class="buyer-name">${customerName}</div>
                  <p class="buyer-address" style="white-space: pre-line;">${address}</p>
                  
                  <div class="undelivered-box">
                    <div class="buyer-title" style="font-size: 9px; margin-bottom: 2px;">If undelivered, Please return to</div>
                    <div style="font-weight: bold; font-size: 11px; text-transform: uppercase;">${returnAddress.companyName || 'PIKS MEDIA INDUSTRIES-'}</div>
                    <div style="font-size: 10px; color: #333; line-height: 1.3;">${returnAddress.addressLine1 || '75C DLF Industrial Area Phase 1 old Share Sha Sun Road'} ${returnAddress.addressLine2 || 'Faridabad Haryana 121003. Faridabad - 121003, Haryana, INDIA.'}</div>
                  </div>
                </div>
                <div style="flex: 0.7; text-align: center; border-left: 1.5px solid #000; padding-left: 16px; display: flex; flex-direction: column; align-items: center;">
                  <img src="${qrImageUrl}" style="width: 140px; height: 140px; display: block;" alt="Scan Secure Code" />
                  
                  <div class="seller-details">
                    <div style="font-weight: 700; text-transform: uppercase; font-size: 9px; color: #555; margin-bottom: 2px;">Buyer Details</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="bottom-info">
                  <div class="declaration">
                    <span style="font-weight: bold; font-size: 9px; display: block; text-transform: uppercase;">Buyer Declaration:</span>
                    I, ${customerName}, declare that the goods in this shipment are for personal use and not for resale.
                    <div style="font-weight: bold; margin-top: 10px; font-size: 11px; color: #111;">SKU: ${skuInfo}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 9px; color: #555; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">Purchase made on</div>
                    <div style="font-size: 16px; font-weight: 800; letter-spacing: -0.5px; color: #000; line-height: 1;">piks media</div>
                    <div style="font-size: 10px; color: #444; margin-top: 4px; font-weight: 500;">${orderDate}</div>
                  </div>
                </div>
              </div>
            </div>
            <script>
              window.onload = function() {
                const images = document.getElementsByTagName('img');
                let loadedCount = 0;
                if (images.length === 0) {
                  triggerPrint();
                } else {
                  for (let i = 0; i < images.length; i++) {
                    if (images[i].complete) {
                      loadedCount++;
                      if (loadedCount === images.length) triggerPrint();
                    } else {
                      images[i].addEventListener('load', function() {
                        loadedCount++;
                        if (loadedCount === images.length) triggerPrint();
                      });
                      images[i].addEventListener('error', function() {
                        loadedCount++;
                        if (loadedCount === images.length) triggerPrint();
                      });
                    }
                  }
                }
              };
              function triggerPrint() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrderToDelete(id);
  };

  const confirmDeleteOrder = async (id: string) => {
    try {
      const targetStr = String(id).toLowerCase();
      setOrders(prev => prev.filter(o => 
        String(o._id).toLowerCase() !== targetStr && 
        String(o.orderId || '').toLowerCase() !== targetStr &&
        String(o.mongoId || '').toLowerCase() !== targetStr &&
        String(o.rawId || '').toLowerCase() !== targetStr
      ));
      await axios.delete(`${API_BASE_URL}/orders/${id}`, {
        headers: getAdminHeaders()
      });
      fetchData();
      toast.success('Order deleted successfully');
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order', error);
      toast.error('Failed to delete order');
      setOrderToDelete(null);
    }
  };

  const handleUpdateHeroImages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/settings/hero-images`, { images: heroImages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Hero images updated successfully!');
    } catch (error) {
      console.error('Error updating hero images', error);
      toast.error('Failed to update hero images');
    }
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageIndex(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const newUrl = res.data.url;
      const newImages = [...heroImages];
      newImages[index] = newUrl;
      setHeroImages(newImages);
      toast.success('Image uploaded successfully! Remember to click Save Changes.');
    } catch (error) {
      console.error('Error uploading file', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleUpdateLandingPageImages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/settings/landing-page-images`, { images: landingPageImages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Landing page images updated successfully!');
    } catch (error) {
      console.error('Error updating landing page images', error);
      toast.error('Failed to update landing page images');
    }
  };

  const handleUpdateTestimonials = async (testimonialsArray?: any[]) => {
    try {
      await axios.put(`${API_BASE_URL}/settings/testimonials`, { testimonials: testimonialsArray || testimonials }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Testimonials updated successfully!');
    } catch (error) {
      console.error('Error updating testimonials', error);
      toast.error('Failed to update testimonials');
    }
  };

  const handleUpdateFooterSettings = async () => {
    try {
      await axios.put(`${API_BASE_URL}/settings/footer`, { footer: footerSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Footer settings updated successfully!');
    } catch (error) {
      console.error('Error updating footer settings', error);
      toast.error('Failed to update footer settings');
    }
  };

  const handleUpdateWhyUsSettings = async () => {
    try {
      await axios.put(`${API_BASE_URL}/settings/why-us`, { whyUs: whyUsSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Why Us page settings updated successfully!');
    } catch (error) {
      console.error('Error updating Why Us settings', error);
      toast.error('Failed to update Why Us settings');
    }
  };

  const handleWhyUsFileUpload = async (fieldPath: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingWhyUsImage(fieldPath);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success && res.data.url) {
        const imageUrl = res.data.url;
        if (fieldPath === 'showcase.image1') {
          setWhyUsSettings((prev: any) => ({ ...prev, showcase: { ...(prev.showcase || {}), image1: imageUrl } }));
        } else if (fieldPath === 'showcase.image2') {
          setWhyUsSettings((prev: any) => ({ ...prev, showcase: { ...(prev.showcase || {}), image2: imageUrl } }));
        } else if (fieldPath === 'founder.image') {
          setWhyUsSettings((prev: any) => ({ ...prev, founder: { ...(prev.founder || {}), image: imageUrl } }));
        }
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Failed to upload image', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingWhyUsImage(null);
    }
  };

  const handleLandingFileUpload = async (section: 'curation' | 'bestSellers' | 'community', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLandingImage({ section, index });
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const newUrl = res.data.url;
      setLandingPageImages(prev => {
        const newSection = [...prev[section]];
        newSection[index] = newUrl;
        return { ...prev, [section]: newSection };
      });
      toast.success('Image uploaded successfully! Remember to click Save Changes.');
    } catch (error) {
      console.error('Error uploading file', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingLandingImage(null);
    }
  };

  const syncActivePincodes = (locs: any[]) => {
    if (!Array.isArray(locs)) return;
    const stdCodes: string[] = [];
    const freeCodes: string[] = [];
    const sameDayCodes: string[] = [];
    const active: { code: string; type: 'standard' | 'free' | 'sameday' }[] = [];

    locs.forEach(l => {
      const code = typeof l === 'string' ? l : l.pincode;
      const type = (typeof l === 'object' && l.deliveryType ? l.deliveryType : 'standard') as 'standard' | 'free' | 'sameday';
      if (code) {
        active.push({ code, type });
        if (type === 'free') freeCodes.push(code);
        else if (type === 'sameday') sameDayCodes.push(code);
        else stdCodes.push(code);
      }
    });

    setStandardPincodes(stdCodes.join(', '));
    setFreePincodes(freeCodes.join(', '));
    setSameDayPincodes(sameDayCodes.join(', '));
    setActivePincodes(active);
  };

  const handleUpdateDeliveryMap = async (e: React.FormEvent) => {
    e.preventDefault();
    const sPins = standardPincodes.split(/[\s,\n]+/).map(p => p.trim().replace(/\D/g, '')).filter(p => p.length === 6);
    const fPins = freePincodes.split(/[\s,\n]+/).map(p => p.trim().replace(/\D/g, '')).filter(p => p.length === 6);
    const sdPins = sameDayPincodes.split(/[\s,\n]+/).map(p => p.trim().replace(/\D/g, '')).filter(p => p.length === 6);
    
    const map = new Map<string, string>();
    sPins.forEach(pin => map.set(pin, 'standard'));
    fPins.forEach(pin => map.set(pin, 'free'));
    sdPins.forEach(pin => map.set(pin, 'sameday'));

    const locations = Array.from(map.entries()).map(([pincode, deliveryType]) => ({
      pincode,
      deliveryType,
      isActive: true
    }));

    try {
      const res = await axios.put(`${API_BASE_URL}/settings/delivery-locations`, { locations }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Delivery map updated & saved to system!');
        setDeliveryLocations(res.data.data);
        syncActivePincodes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update delivery map', err);
      toast.error('Failed to update delivery map');
    }
  };

  const handleDeletePincode = async (code: string) => {
    const updated = (deliveryLocations || []).filter((l: any) => (typeof l === 'string' ? l : l.pincode) !== code);
    try {
      const res = await axios.put(`${API_BASE_URL}/settings/delivery-locations`, { locations: updated }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Removed pincode ${code}`);
        setDeliveryLocations(res.data.data);
        syncActivePincodes(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to remove pincode');
    }
  };

  const handleUpdateReturnAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/settings/shipping-return-address`, { address: returnAddress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Shipping Return Address updated successfully!');
        setReturnAddress(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update shipping return address', err);
      toast.error('Failed to update shipping return address');
    }
  };

  if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null; // Don't render until client confirms admin status
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'viewers', label: 'Viewers', icon: Eye },
    { id: 'categories', label: 'Categories', icon: List },
    { id: 'coupons', label: 'Coupons & Offers', icon: Tag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'returns', label: 'Returns', icon: RefreshCcw },
    { id: 'cancelled-orders', label: 'Cancelled Orders', icon: XCircle },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'delivery', label: 'Delivery Locations', icon: MapPin },
    { id: 'hero', label: 'Hero Images', icon: ImageIcon },
    { id: 'landing', label: 'Landing Pages', icon: Home },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'footer', label: 'Footer Settings', icon: Settings },
    { id: 'why-us', label: 'Why Us? Content', icon: HelpCircle },
    { id: 'contact', label: 'Contact Requests', icon: Mail },
    { id: 'support-pages', label: 'Support Pages', icon: LayoutDashboard },
    { id: 'navigation', label: 'Navigation', icon: List },
    { id: 'legal', label: 'Legal Pages', icon: List },
    { id: 'account', label: 'Account', icon: UserIcon },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        footer { display: none !important; }
        .custom-admin-sidebar::-webkit-scrollbar { width: 4px; }
        .custom-admin-sidebar::-webkit-scrollbar-track { background: transparent; margin-top: 12px; margin-bottom: 12px; }
        .custom-admin-sidebar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 9999px; }
        .custom-admin-sidebar::-webkit-scrollbar-thumb:hover { background: #907341; }
      ` }} />
      <div className="min-h-screen bg-stone-50 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="md:w-64 flex items-center justify-center pt-3 pb-1">
              <img src="/logo.png" alt="Piks Logo" className="h-14 md:h-16 w-auto object-contain drop-shadow-xs" />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="font-semibold text-stone-900">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider font-bold">{user.role}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm shrink-0 border border-stone-200">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.firstName?.charAt(0)
                )}
              </div>
            </div>
          </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-stone-200 sticky top-28 shadow-sm overflow-hidden">
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 custom-admin-sidebar">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                  
                  <hr className="my-4 border-stone-100" />
                  
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading && activeTab !== 'overview' ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
                <p className="mt-4 text-stone-500">Loading data...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Total Revenue</h3>
                        <p className="text-3xl font-black text-stone-900">₹{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Total Orders</h3>
                        <p className="text-3xl font-black text-stone-900">{stats.totalOrders}</p>
                      </div>
                      <div 
                        onClick={() => setActiveTab('orders')}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-stone-400 hover:shadow-md transition-all group"
                        title="Click to view pending orders"
                      >
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                          <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Pending Orders</h3>
                        <p className="text-3xl font-black text-stone-900">
                          {orders.filter((o: any) => {
                            const s = String(o.status || 'Pending').toUpperCase();
                            return s === 'PENDING' || s === 'CONFIRMED' || s === 'PROCESSING';
                          }).length}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3">
                          <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Customers</h3>
                        <p className="text-3xl font-black text-stone-900">{stats.totalUsers}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-3">
                          <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">New Contacts</h3>
                        <p className="text-3xl font-black text-stone-900">{contactRequests.filter((req: any) => req.status === 'new').length}</p>
                      </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                      <h2 className="text-xl font-bold mb-6 text-stone-900">Recent Orders</h2>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-stone-50 text-stone-500 font-medium">
                            <tr>
                              <th className="px-4 py-3 rounded-l-lg font-semibold text-xs tracking-wider uppercase">ORDER ID</th>
                              <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase">CUSTOMER</th>
                              <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase">AMOUNT</th>
                              <th className="px-4 py-3 font-semibold text-xs tracking-wider uppercase">STATUS</th>
                              <th className="px-4 py-3 rounded-r-lg font-semibold text-xs tracking-wider uppercase">DATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-stone-400 text-center">
                                  No recent orders
                                </td>
                              </tr>
                            ) : (
                              orders.slice(0, 5).map((order: any) => (
                                <tr key={order._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors">
                                  <td className="px-4 py-4 text-stone-900 font-medium font-mono text-xs">{order.orderId || order._id}</td>
                                  <td className="px-4 py-4 text-stone-900 font-medium">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</td>
                                  <td className="px-4 py-4 font-bold text-stone-900">₹{order.totalPrice?.toLocaleString() || 0}</td>
                                  <td className="px-4 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                      order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {order.status || 'UNKNOWN'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Viewers Tab */}
                {activeTab === 'viewers' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                          <Eye className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-stone-900">Viewer Analytics</h3>
                          <p className="text-sm text-stone-500">Real-time visitor traffic and checkout abandonment tracking</p>
                        </div>
                      </div>
                    </div>

                    {loadingViewerStats ? (
                      <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center shadow-xs">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900 mx-auto"></div>
                        <p className="mt-4 text-stone-500">Calculating visitor analytics...</p>
                      </div>
                    ) : viewerStats ? (
                      <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Card 1: Total Visitors */}
                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Visitors</p>
                              <h4 className="text-4xl font-extrabold text-stone-900 mt-2">{Number(viewerStats.totalVisitors).toLocaleString()}</h4>
                            </div>
                            <p className="text-xs text-stone-400 mt-4">All-time unique user sessions</p>
                          </div>

                          {/* Card 2: Total Buyers */}
                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider text-emerald-700 font-semibold">Total Buyers</p>
                              <h4 className="text-4xl font-extrabold text-stone-900 mt-2">{Number(viewerStats.totalBuyers || 0).toLocaleString()}</h4>
                            </div>
                            <p className="text-xs text-emerald-600 font-medium mt-4">Customers who placed orders</p>
                          </div>

                          {/* Card 3: Weekly Analytics */}
                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Weekly Bounce Rate</p>
                            <h4 className="text-4xl font-extrabold text-stone-900 mt-2">{viewerStats.weeklyBounces} <span className="text-sm font-normal text-stone-500">left</span></h4>
                            <div className="mt-4 space-y-1">
                              <div className="flex justify-between text-xs text-stone-500">
                                <span>Weekly Visitors:</span>
                                <span className="font-semibold">{viewerStats.weeklyTotal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card 4: Monthly Analytics */}
                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Monthly Bounce Rate</p>
                            <h4 className="text-4xl font-extrabold text-stone-900 mt-2">{viewerStats.monthlyBounces} <span className="text-sm font-normal text-stone-500">left</span></h4>
                            <div className="mt-4 space-y-1">
                              <div className="flex justify-between text-xs text-stone-500">
                                <span>Monthly Visitors:</span>
                                <span className="font-semibold">{viewerStats.monthlyTotal}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Turnaround Rate Graphical Representation */}
                        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
                          <h4 className="text-lg font-bold text-stone-900 mb-6 font-semibold">Turnaround Rate (Conversion)</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Weekly Ring */}
                            <div className="flex flex-col items-center p-6 bg-stone-50 rounded-xl border border-stone-100">
                              <span className="text-sm font-bold text-stone-600 mb-4">Weekly Turnaround</span>
                              <div className="relative flex items-center justify-center">
                                {(() => {
                                  const rate = Number(viewerStats.weeklyConversionRate || 0);
                                  const radius = 50;
                                  const circ = 2 * Math.PI * radius;
                                  const offset = circ - (rate / 100) * circ;
                                  return (
                                    <>
                                      <svg className="w-36 h-36 transform -rotate-90">
                                        <circle cx="72" cy="72" r={radius} className="text-stone-200" strokeWidth="8" stroke="currentColor" fill="transparent" />
                                        <circle cx="72" cy="72" r={radius} className="text-emerald-600 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                                      </svg>
                                      <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-stone-950">{rate}%</span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="text-xs text-stone-500 mt-4 font-medium text-center">Percentage of weekly visitors converted to buyers</p>
                            </div>

                            {/* Monthly Ring */}
                            <div className="flex flex-col items-center p-6 bg-stone-50 rounded-xl border border-stone-100">
                              <span className="text-sm font-bold text-stone-600 mb-4">Monthly Turnaround</span>
                              <div className="relative flex items-center justify-center">
                                {(() => {
                                  const rate = Number(viewerStats.monthlyConversionRate || 0);
                                  const radius = 50;
                                  const circ = 2 * Math.PI * radius;
                                  const offset = circ - (rate / 100) * circ;
                                  return (
                                    <>
                                      <svg className="w-36 h-36 transform -rotate-90">
                                        <circle cx="72" cy="72" r={radius} className="text-stone-200" strokeWidth="8" stroke="currentColor" fill="transparent" />
                                        <circle cx="72" cy="72" r={radius} className="text-emerald-600 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                                      </svg>
                                      <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-stone-950">{rate}%</span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="text-xs text-stone-500 mt-4 font-medium text-center">Percentage of monthly visitors converted to buyers</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 shadow-xs">
                        No analytics records found.
                      </div>
                    )}
                  </div>
                )}

                {/* Coupons & Offers Tab */}
                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Coupons Column */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-medium">Coupon Banner Scrolling Management</h2>
                        <button 
                          onClick={() => {
                            setNewCoupon({ code: '', discountText: '', bannerText: '', isActive: true });
                            setShowAddCoupon(true);
                          }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Coupon
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="pb-3 pr-4 min-w-[100px]">Code</th>
                              <th className="pb-3 px-4 min-w-[70px] text-center">Type</th>
                              <th className="pb-3 px-4 min-w-[80px] text-center">Value</th>
                              <th className="pb-3 px-4 min-w-[100px] text-center">Min. Spend</th>
                              <th className="pb-3 px-4 min-w-[120px] text-center">Expiry Date</th>
                              <th className="pb-3 px-4 min-w-[90px] text-center">Status</th>
                              <th className="pb-3 pl-4 min-w-[80px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {coupons.map(coupon => (
                              <tr key={coupon._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                <td className="py-3 pr-4 font-semibold text-stone-900 font-mono">{coupon.code}</td>
                                <td className="py-3 px-4 text-center text-stone-700 font-medium text-base">{coupon.discountType === 'percentage' ? '%' : '₹'}</td>
                                <td className="py-3 px-4 text-center text-stone-700 font-bold">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                                <td className="py-3 px-4 text-center text-stone-700">₹{coupon.minSpend || 0}</td>
                                <td className="py-3 px-4 text-center text-stone-500">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-IN') : 'No Expiry'}</td>
                                <td className="py-3 px-4 text-center">
                                  {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < today;
                                    const active = coupon.isActive && !isExpired;
                                    return (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                                        {active ? 'Active' : 'Inactive'}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="py-3 pl-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => { 
                                      setNewCoupon({
                                        ...coupon,
                                        discountType: coupon.discountType || 'percentage',
                                        discountValue: coupon.discountValue || '',
                                        minSpend: coupon.minSpend !== undefined ? coupon.minSpend : '0',
                                        expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : ''
                                      }); 
                                      setShowAddCoupon(true); 
                                    }} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCouponToDelete(coupon._id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {coupons.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-stone-500">No coupons found. Add some to get started.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Offers Column */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-medium">Offers Popup Modal Management</h2>
                        <button 
                          onClick={() => {
                            setNewOffer({ title: '', subtitle: '', image: '', expiryDate: '', isActive: true });
                            setShowAddOffer(true);
                          }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Offer
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="pb-3 pr-4 min-w-[80px]">Image</th>
                              <th className="pb-3 px-4 min-w-[150px]">Offer Title</th>
                              <th className="pb-3 px-4 min-w-[120px] text-center">Expiry Date</th>
                              <th className="pb-3 px-4 min-w-[90px] text-center">Status</th>
                              <th className="pb-3 pl-4 min-w-[80px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {offers.map(offer => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isExpired = offer.expiryDate && new Date(offer.expiryDate) < today;
                              const active = offer.isActive && !isExpired;
                              return (
                                <tr key={offer._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                  <td className="py-3 pr-4">
                                    {offer.image ? (
                                      <img src={offer.image} alt={offer.title} className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                                    ) : (
                                      <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center text-[10px] text-stone-400 font-medium border border-stone-200">No Img</div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-semibold text-stone-900">{offer.title}</div>
                                    <div className="text-xs text-[#907341] font-semibold uppercase mt-0.5">
                                      {(() => {
                                        const typeStr = offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`;
                                        const catStr = !offer.category || offer.category === 'all' ? 'ALL PRODUCTS' : `${offer.category.toUpperCase()} PRODUCTS`;
                                        return `FLAT ${typeStr} OFF ON ${catStr}`;
                                      })()}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center text-stone-500">{offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString('en-IN') : 'No Expiry'}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                                      {active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="py-3 pl-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <button onClick={() => { 
                                        setNewOffer({
                                          ...offer,
                                          discountType: offer.discountType || 'percentage',
                                          discountValue: offer.discountValue || '',
                                          category: offer.category || 'all',
                                          expiryDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : ''
                                        }); 
                                        setShowAddOffer(true); 
                                      }} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => setOfferToDelete(offer._id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {offers.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-stone-500">No offers found. Add some to get started.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Add/Edit Coupon Modal */}
                    {showAddCoupon && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
                          <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
                            <h3 className="text-xl font-bold text-stone-900">{newCoupon._id ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                            <button onClick={() => setShowAddCoupon(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[80vh] flex-1">
                            <form onSubmit={handleAddCoupon} className="flex flex-col gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Coupon Code</label>
                                <input required type="text" placeholder="e.g. SAVE20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors uppercase font-mono" />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Type</label>
                                  <select value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Value</label>
                                  <input required type="number" placeholder="10 or 500" value={newCoupon.discountValue} onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Min. Spend (₹)</label>
                                  <input required type="number" placeholder="0" value={newCoupon.minSpend} onChange={e => setNewCoupon({...newCoupon, minSpend: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Expiry Date</label>
                                  <input type="date" value={newCoupon.expiryDate || ''} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddCoupon(false)} className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                                <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm">Save Coupon</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}

                    {couponToDelete && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform">
                          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Coupon</h3>
                          <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this coupon? This will remove it from the home page scroll.</p>
                          <div className="flex gap-3 justify-center w-full">
                            <button onClick={() => setCouponToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                            <button onClick={() => handleDeleteCoupon(couponToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add/Edit Offer Modal */}
                    {showAddOffer && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
                          <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
                            <h3 className="text-xl font-bold text-stone-900">{newOffer._id ? 'Edit Offer' : 'Add New Offer'}</h3>
                            <button onClick={() => setShowAddOffer(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[80vh] flex-1">
                            <form onSubmit={handleAddOffer} className="flex flex-col gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Offer Title</label>
                                <input required type="text" placeholder="e.g. Grand Festive Opening!" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Type</label>
                                  <select value={newOffer.discountType || 'percentage'} onChange={e => setNewOffer({...newOffer, discountType: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Value</label>
                                  <input required type="number" placeholder="10 or 500" value={newOffer.discountValue || ''} onChange={e => setNewOffer({...newOffer, discountValue: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category</label>
                                <select value={newOffer.category || 'all'} onChange={e => setNewOffer({...newOffer, category: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white capitalize">
                                  <option value="all">All Products</option>
                                  {categories.map((cat: any) => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Offer Image (Upload file)</label>
                                  <div className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-white">
                                    <input type="file" accept="image/*" onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setNewOffer({...newOffer, image: ev.target?.result as string});
                                        reader.readAsDataURL(e.target.files[0]);
                                      }
                                    }} className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Expiry Date</label>
                                  <input type="date" value={newOffer.expiryDate || ''} onChange={e => setNewOffer({...newOffer, expiryDate: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                              </div>

                              {newOffer.image && (
                                <div className="mt-1 flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-200">
                                  <img src={newOffer.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-stone-200" />
                                  <div className="text-xs text-stone-600">
                                    <span className="font-semibold text-stone-900">Offer Image Preview</span>
                                    <p className="text-[11px] text-stone-500">Popup background image loaded</p>
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddOffer(false)} className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                                <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm">Save Offer</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}


                    {offerToDelete && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform">
                          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Offer</h3>
                          <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this offer? This will stop it from popping up.</p>
                          <div className="flex gap-3 justify-center w-full">
                            <button onClick={() => setOfferToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                            <button onClick={() => handleDeleteOffer(offerToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Categories Column */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-medium">Category Management</h2>
                        <button 
                          onClick={() => {
                            setNewCategory({ name: '', description: '', sizeChart: '', availableSizes: [], sizeUnit: 'inches(in)' });
                            setShowAddCategory(true);
                          }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="pb-3">Cover Image</th>
                              <th className="pb-3">Category Details</th>
                              <th className="pb-3">Badge</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {categories.map(category => (
                              <tr key={category._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                <td className="py-3">
                                  {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-10 h-12 object-cover rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-stone-200 shadow-xs" />
                                  ) : (
                                    <div className="w-10 h-12 bg-stone-100 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-medium">No Img</div>
                                  )}
                                </td>
                                <td className="py-3">
                                  <div className="font-semibold text-stone-900">{category.name}</div>
                                  <div className="text-xs text-stone-500">{category.description || '-'}</div>
                                </td>
                                <td className="py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2EFE9] text-[#907341] border border-[#e2ded5]">
                                    {category.badge || 'Popular'}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => { 
                                      setNewCategory({ 
                                        ...category, 
                                        image: category.image || '',
                                        badge: category.badge || 'Popular',
                                        description: category.description || '',
                                        availableSizes: Array.isArray(category.availableSizes) ? category.availableSizes : [],
                                        sizeUnit: category.sizeUnit || 'inches(in)'
                                      }); 
                                      setShowAddCategory(true); 
                                    }} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCategoryToDelete(category._id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {categories.length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-stone-500">No categories found. Add some to get started.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sizes Column */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-medium">Size Management</h2>
                        <button 
                          onClick={() => {
                            setNewSize('');
                            setShowAddSize(true);
                          }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Size
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-sm text-stone-500">
                              <th className="pb-3 font-medium">Size Name</th>
                              <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {sizes.map(size => (
                              <tr key={size._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                <td className="py-4 font-medium">{size.name}</td>
                                <td className="py-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => setSizeToDelete(size._id)} className="text-red-500 hover:text-red-700 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {sizes.length === 0 && (
                              <tr>
                                <td colSpan={2} className="py-8 text-center text-stone-500">No sizes found. Add some to get started.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Add Category Modal */}
                    {showAddCategory && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
                          <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
                            <h3 className="text-xl font-bold text-stone-900">{newCategory._id ? 'Edit Category' : 'Add New Category'}</h3>
                            <button onClick={() => setShowAddCategory(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[80vh] flex-1">
                            <form onSubmit={handleAddCategory} className="flex flex-col gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category Name</label>
                                <input required type="text" placeholder="e.g. Regular Frames" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Subtitle / Sub-description</label>
                                <input type="text" placeholder="e.g. Handcrafted Wood, Archival Quality" value={newCategory.description || ''} onChange={e => setNewCategory({...newCategory, description: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Badge Label</label>
                                <input type="text" placeholder="e.g. Popular, Giclée, Artisan" value={newCategory.badge || ''} onChange={e => setNewCategory({...newCategory, badge: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors mb-2" />
                                <div className="flex flex-wrap gap-1.5">
                                  {['Popular', 'Giclée', 'Textured', 'Handmade', 'Artisan', 'Tribute', 'Custom'].map(presetBadge => (
                                    <button
                                      key={presetBadge}
                                      type="button"
                                      onClick={() => setNewCategory({...newCategory, badge: presetBadge})}
                                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                                        newCategory.badge === presetBadge 
                                          ? 'bg-[#907341] text-white border-[#907341]' 
                                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                      }`}
                                    >
                                      + {presetBadge}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Cover Image</label>
                                <div className="flex flex-col gap-3">
                                  <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white">
                                    <input type="file" accept="image/*" onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setNewCategory({...newCategory, image: ev.target?.result as string});
                                        reader.readAsDataURL(e.target.files[0]);
                                      }
                                    }} className="text-sm text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                                  </div>
                                  {newCategory.image && (
                                    <div className="mt-1 flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-200">
                                      <img src={newCategory.image} alt="Preview" className="w-12 h-16 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md object-cover border border-stone-200" />
                                      <div className="text-xs text-stone-600">
                                        <span className="font-semibold text-stone-900">Cover Image Preview</span>
                                        <p className="text-[11px] text-stone-500">Card cover ready</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddCategory(false)} className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                                <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm">Save Category</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}

                    {categoryToDelete && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform">
                          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Category</h3>
                          <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                          <div className="flex gap-3 justify-center w-full">
                            <button onClick={() => setCategoryToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                            <button onClick={() => handleDeleteCategory(categoryToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add Size Modal */}
                    {showAddSize && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-stone-900">Add New Size</h3>
                            <button onClick={() => setShowAddSize(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                          <form onSubmit={handleAddSize} className="flex flex-col gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Size Name</label>
                              <input required type="text" placeholder="e.g. 8x6" value={newSize} onChange={e => setNewSize(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Size Unit</label>
                              <select value={newSizeUnit} onChange={e => setNewSizeUnit(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white">
                                <option value="inches(in)">inches (in)</option>
                                <option value="centimeters(cm)">centimeters (cm)</option>
                                <option value="feet(ft)">feet (ft)</option>
                              </select>
                            </div>
                            <div className="flex justify-end gap-3">
                              <button type="button" onClick={() => setShowAddSize(false)} className="px-6 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                              <button type="submit" className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm">Save Size</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}



                  </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-medium">Catalog Management</h2>
                      <button 
                        onClick={() => {
                          setNewProduct({
                            title: '', description: '', price: '', image: '', category: '', stock: '', 
                            returnDays: false, replacementDays: false, policyText: '', mockup: false, 
                            deliveryCharges: '', freeShippingThreshold: '', gallery: [], mockupImage: '', 
                            variants: [], tag: '' 
                          });
                          setShowAddProduct(true);
                        }}
                        className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>

                    {showAddProduct && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                          <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
                            <h3 className="text-xl font-bold text-stone-900">{newProduct._id ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setShowAddProduct(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">
                            <form onSubmit={handleAddProduct} className="flex flex-col gap-6">
                          
                          {/* Row 1 */}
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Product Title</label>
                            <input required type="text" placeholder="e.g. Classic Wooden Frame" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                          </div>

                          {/* Row 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Price (₹)</label>
                              <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Delivery Charges (₹)</label>
                              <input type="number" placeholder="0" value={newProduct.deliveryCharges} onChange={e => setNewProduct({...newProduct, deliveryCharges: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Free Shipping Above (₹)</label>
                              <input type="number" placeholder="e.g. 10000" value={newProduct.freeShippingThreshold} onChange={e => setNewProduct({...newProduct, freeShippingThreshold: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Initial Stock</label>
                              <input required type="number" placeholder="10" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                            </div>
                          </div>

                          {/* Row 3 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category</label>
                              <select 
                                value={(() => {
                                  const val = typeof newProduct.category === 'object' && newProduct.category 
                                    ? (newProduct.category._id || newProduct.category.name || '')
                                    : String(newProduct.category || '').trim();
                                  const match = categories.find(c => String(c._id) === val || c.name.toLowerCase() === val.toLowerCase() || (c.slug && c.slug.toLowerCase() === val.toLowerCase()));
                                  return match ? (match._id || match.name) : val;
                                })()} 
                                onChange={e => {
                                  const selectedVal = e.target.value;
                                  const matchedCat = categories.find(c => 
                                    String(c._id) === String(selectedVal) || 
                                    c.name.toLowerCase() === String(selectedVal).toLowerCase() || 
                                    (c.slug && c.slug.toLowerCase() === String(selectedVal).toLowerCase())
                                  );
                                  setNewProduct({
                                    ...newProduct, 
                                    category: matchedCat ? { _id: matchedCat._id || selectedVal, name: matchedCat.name, slug: matchedCat.slug } : selectedVal
                                  });
                                }} 
                                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white font-medium text-stone-900"
                              >
                                <option value="">Select a category</option>
                                {categories.map(c => (
                                  <option key={c._id || c.name} value={c._id || c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Product Tag / Badge</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Best Seller, Limited Edition" 
                                value={newProduct.tag || ''} 
                                onChange={e => setNewProduct({...newProduct, tag: e.target.value})} 
                                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors mb-2" 
                              />
                              <div className="flex flex-wrap gap-1.5">
                                {['Best Seller', 'Limited Edition', 'New', 'Exclusive'].map((tagOption) => (
                                  <button
                                    key={tagOption}
                                    type="button"
                                    onClick={() => setNewProduct({...newProduct, tag: tagOption})}
                                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                                      newProduct.tag === tagOption 
                                        ? 'bg-[#907341] text-white border-[#907341]' 
                                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                    }`}
                                  >
                                    + {tagOption}
                                  </button>
                                ))}
                                {newProduct.tag && (
                                  <button
                                    type="button"
                                    onClick={() => setNewProduct({...newProduct, tag: ''})}
                                    className="text-[11px] text-red-500 font-semibold hover:underline px-1"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 4 (Checkboxes) */}
                          <div className="flex items-center gap-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={newProduct.returnDays} onChange={e => setNewProduct({...newProduct, returnDays: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                              <span className="text-sm font-semibold text-stone-700">7 Days Return</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={newProduct.replacementDays} onChange={e => setNewProduct({...newProduct, replacementDays: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                              <span className="text-sm font-semibold text-stone-700">7 Days Replacement</span>
                            </label>
                          </div>

                          <div className="flex flex-col gap-4 mt-2">
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                              <label className="block text-sm font-semibold text-stone-700 mb-3">Select Sizes & Set Prices (₹)</label>
                              <div className="flex flex-col gap-4">
                                {sizes.map((size: any) => {
                                  const existingVariant = (newProduct.variants || []).find((v: any) => v.size === size.name);
                                  const isSelected = !!existingVariant;
                                  
                                  return (
                                    <div key={size._id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-stone-200">
                                      <label className="flex items-center gap-2 cursor-pointer w-24">
                                        <input 
                                          type="checkbox" 
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const current = newProduct.variants || [];
                                            if (e.target.checked) {
                                              setNewProduct({...newProduct, variants: [...current, { size: size.name, price: newProduct.price || 0 }]});
                                            } else {
                                              setNewProduct({...newProduct, variants: current.filter((v: any) => v.size !== size.name)});
                                            }
                                          }}
                                          className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900" 
                                        />
                                        <span className="text-sm font-medium text-stone-700">{size.name}</span>
                                      </label>
                                      
                                      {isSelected && (
                                        <div className="flex items-center gap-2 flex-1">
                                          <span className="text-sm text-stone-500">₹</span>
                                          <input 
                                            type="number"
                                            value={existingVariant.price}
                                            onChange={(e) => {
                                              const current = newProduct.variants || [];
                                              const updated = current.map((v: any) => v.size === size.name ? { ...v, price: Number(e.target.value) } : v);
                                              setNewProduct({...newProduct, variants: updated});
                                            }}
                                            placeholder="Price"
                                            className="w-32 px-3 py-1.5 rounded-md border border-stone-200 outline-none focus:border-stone-900 text-sm"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {sizes.length === 0 && <span className="text-sm text-stone-500">No sizes available. Add them in Categories tab.</span>}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Size Chart (Image)</label>
                              <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white">
                                <input type="file" accept="image/*" onChange={async (e) => {
                                  if (e.target.files?.[0]) {
                                    const compressed = await compressImageDataUrl(e.target.files[0], 1000, 0.8);
                                    setNewProduct((prev: any) => ({...prev, sizeChart: compressed, hasSizeChart: true}));
                                  }
                                }} className="text-sm text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                              </div>
                              {newProduct.sizeChart && (
                                <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
                                  <img src={newProduct.sizeChart} className="w-8 h-8 rounded object-cover border border-stone-200" />
                                  <span>Size chart uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <hr className="border-stone-100" />

                          {/* Image Row 1 */}
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Main Image</label>
                            <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white">
                              <input type="file" accept="image/*" onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  const imgData = await compressImageDataUrl(e.target.files[0], 1200, 0.82);
                                  setNewProduct((prev: any) => ({
                                    ...prev, 
                                    image: imgData, 
                                    images: [imgData, ...(Array.isArray(prev.gallery) ? prev.gallery : [])] 
                                  }));
                                }
                              }} className="text-sm text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                            </div>
                            {newProduct.image && (
                              <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
                                <img src={newProduct.image} className="w-8 h-8 rounded object-cover border border-stone-200" />
                                <span>Image uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Image Row 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Product Gallery (Multiple)</label>
                              <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white">
                                <input type="file" multiple accept="image/*" onChange={async (e) => {
                                  if (e.target.files?.length) {
                                    const files = Array.from(e.target.files);
                                    const base64s = await Promise.all(
                                      files.map((file) => compressImageDataUrl(file, 1000, 0.8))
                                    );
                                    setNewProduct((prev: any) => ({
                                      ...prev, 
                                      gallery: base64s,
                                      images: prev.image ? [prev.image, ...base64s] : base64s
                                    }));
                                  }
                                }} className="text-sm text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                              </div>
                              <p className="text-xs text-stone-500 mt-1">Select multiple angle shots</p>
                              {newProduct.gallery?.length > 0 && (
                                <p className="text-xs text-stone-900 font-semibold mt-1">{newProduct.gallery.length} Gallery images uploaded</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mockup Overlay (PNG)</label>
                              <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white">
                                <input type="file" accept="image/png" onChange={async (e) => {
                                  if (e.target.files?.[0]) {
                                    const imgData = await compressImageDataUrl(e.target.files[0], 1000, 0.85);
                                    setNewProduct((prev: any) => ({...prev, mockup: true, mockupImage: imgData}));
                                  }
                                }} className="text-sm text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                              </div>
                              <p className="text-xs text-stone-500 mt-1">PNG with Transparency</p>
                              {newProduct.mockup && (
                                <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
                                  {newProduct.mockupImage && newProduct.mockupImage !== '(Mockup uploaded)' && (
                                    <img src={newProduct.mockupImage} className="w-8 h-8 rounded object-cover border border-stone-200" />
                                  )}
                                  <span className="text-stone-900 font-semibold">Mockup uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Marketing Description */}
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Marketing Description</label>
                            <textarea required rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors"></textarea>
                          </div>

                          <hr className="border-stone-100" />

                          {/* Policy Text Area */}
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Return & Replacement Policy Text</label>
                            <p className="text-xs text-stone-500 mb-2">Specify exact conditions (e.g. accepted only when damaged, wrong product delivered, or wrong design printed).</p>
                            <textarea rows={2} value={newProduct.policyText} onChange={e => setNewProduct({...newProduct, policyText: e.target.value})} placeholder="Add the text related to return and replace..." className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900 transition-colors"></textarea>
                          </div>

                          {/* Submit */}
                          <div className="mt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowAddProduct(false)} disabled={savingProduct} className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50">Cancel</button>
                            <button type="submit" disabled={savingProduct} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                              {savingProduct && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                              {savingProduct ? 'Saving...' : 'Save Product'}
                            </button>
                          </div>
                        </form>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                            <th className="pb-3">Visual</th>
                            <th className="pb-3">Title</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Tag</th>
                            <th className="pb-3">Mockup</th>
                            <th className="pb-3">Stock</th>
                            <th className="pb-3">Price</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {products.map(product => (
                            <tr key={product._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                              <td className="py-4">
                                <img src={(product.images && product.images.length > 0) ? product.images[0] : (product.image || 'https://placehold.co/40x40/f5f5f4/a8a29e?text=No+Img')} alt={product.title} className="w-10 h-10 rounded-md object-cover border border-stone-100" />
                              </td>
                              <td className="py-4 font-medium text-stone-900">{product.title}</td>
                              <td className="py-4 text-stone-500 font-medium">
                                {(() => {
                                  if (typeof product.category === 'object' && product.category?.name) {
                                    return product.category.name;
                                  }
                                  const catVal = String(product.category || '').trim();
                                  const matchedCat = categories.find(c => 
                                    String(c._id) === catVal || 
                                    c.name.toLowerCase() === catVal.toLowerCase() || 
                                    (c.slug && c.slug.toLowerCase() === catVal.toLowerCase())
                                  );
                                  return matchedCat ? matchedCat.name : (catVal || '-');
                                })()}
                              </td>
                              <td className="py-4">
                                {product.tag ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2EFE9] text-[#907341] border border-[#e2ded5]">
                                    {product.tag}
                                  </span>
                                ) : (
                                  <span className="text-xs text-stone-400">-</span>
                                )}
                              </td>
                              <td className="py-4 text-stone-500">
                                {product.mockupImage && product.mockupImage !== '(Mockup uploaded)' ? (
                                  <img src={product.mockupImage} alt="Mockup" className="w-10 h-10 rounded-md object-contain border border-stone-100 bg-stone-50 p-1" />
                                ) : product.mockup ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-stone-100 text-xs font-medium">Yes</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-stone-50 text-xs text-stone-400">No</span>
                                )}
                              </td>
                              <td className="py-4">{product.stock || 10}</td>
                              <td className="py-4 font-medium text-stone-900">₹{product.price}</td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => { 
                                     let catId = '';
                                     if (typeof product.category === 'object' && product.category) {
                                       catId = product.category._id || product.category.id || product.category.name || '';
                                     } else {
                                       catId = String(product.category || '').trim();
                                     }
                                     const matchedCategoryDoc = categories.find(c => 
                                       String(c._id) === catId || 
                                       c.name.toLowerCase() === catId.toLowerCase() || 
                                       (c.slug && c.slug.toLowerCase() === catId.toLowerCase())
                                     );

                                     setNewProduct({
                                       ...product,
                                       category: matchedCategoryDoc 
                                          ? { _id: matchedCategoryDoc._id, name: matchedCategoryDoc.name, slug: matchedCategoryDoc.slug } 
                                          : (typeof product.category === 'object' ? product.category : catId),
                                       description: product.description || '',
                                       stock: product.stock !== undefined ? product.stock : 10,
                                       tag: product.tag || '',
                                       returnDays: Boolean(product.returnDays),
                                       replacementDays: Boolean(product.replacementDays),
                                       hasSizeChart: Boolean(product.hasSizeChart),
                                       policyText: product.policyText || '',
                                       sizeChart: product.sizeChart || '',
                                       mockup: Boolean(product.mockup || product.mockupImage),
                                       deliveryCharges: product.deliveryCharges !== undefined ? product.deliveryCharges : 0,
                                       freeShippingThreshold: product.freeShippingThreshold !== undefined ? product.freeShippingThreshold : 0,
                                       gallery: (Array.isArray(product.images) && product.images.length > 1) ? product.images.slice(1) : (Array.isArray(product.gallery) ? product.gallery : []),
                                       mockupImage: product.mockupImage || '',
                                       variants: product.variants || [],
                                       image: (Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : (product.image || '')
                                     }); 
                                     setShowAddProduct(true); 
                                  }} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {products.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-stone-500">No products found. Add some to get started.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-2xl font-medium mb-6">Orders</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                            <th className="pb-3 px-4">Order ID</th>
                            <th className="pb-3 px-4">Customer</th>
                            <th className="pb-3 px-4">Amount</th>
                            <th className="pb-3 px-4">Payment</th>
                            <th className="pb-3 px-4">Status</th>
                            <th className="pb-3 px-4">Date</th>
                            <th className="pb-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {orders.filter(o => {
                            if (o.isReturned) return false;
                            if (o.actionReason || o.actionNotes || o.expectedReplacementDate || o.actionRequestedAt) return false;
                            if (Array.isArray(o.proofMedia) && o.proofMedia.length > 0) return false;
                            const s = String(o.status || '').toUpperCase().replace(/\s+/g, '_');
                            return !s.includes('RETURN') && !s.includes('REPLACE') && !s.includes('EXCHANGE') && !s.includes('REFUND');
                          }).map(order => {
                            const orderStatus = orderStatuses[order._id] || order.status || (order.isDelivered ? 'Delivered' : 'Pending');
                            return (
                              <tr key={order._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors align-top">
                                <td className="py-6 px-4 font-mono text-xs text-stone-900">{order._id}</td>
                                <td className="py-6 px-4">
                                  <div className="font-bold text-stone-900 text-base">{order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest')}</div>
                                  <div className="text-stone-500 mb-4">{order.user?.email || order.shippingAddress?.email || ''}</div>
                                  
                                  <div className="bg-stone-50 rounded-xl p-4 mb-3 border border-stone-100">
                                    <div className="flex items-center gap-2 mb-2 text-stone-700 font-medium text-xs">
                                      <Phone className="w-3 h-3" /> Mobile: <span className="font-normal">{order.shippingAddress?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-stone-700 font-medium text-xs">
                                      <MapPin className="w-3 h-3" /> Pincode: <span className="font-normal">{order.shippingAddress?.postalCode || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-stone-700 font-medium text-xs">
                                      <Home className="w-3 h-3 mt-0.5" /> 
                                      <div className="flex-1">
                                        Address:
                                        <div className="font-normal mt-1 leading-relaxed">
                                          {order.shippingAddress?.address}<br />
                                          {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                                     <div className="flex items-center justify-between mb-2">
                                       <div className="font-bold text-xs text-stone-900">Items in Order:</div>
                                       {(order.status === 'CANCELLED' || order.status === 'Cancelled') && (
                                         <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md uppercase">
                                           Order Cancelled
                                         </span>
                                       )}
                                     </div>
                                     <ul className="list-disc pl-4 text-xs text-stone-600 space-y-1.5">
                                       {order.orderItems?.map((item: any, i: number) => {
                                         const prodId = item.product || item.productId || item._id;
                                         const prodLink = prodId ? `/shop/${prodId}` : `/shop`;
                                         return (
                                           <li key={i} className="flex items-center justify-between gap-2">
                                             <span>
                                               {item.quantity}x{' '}
                                               <Link
                                                 href={prodLink}
                                                 target="_blank"
                                                 className="hover:underline hover:text-stone-900 transition-colors font-semibold text-stone-900 inline-flex items-center gap-1"
                                                 title={`Click to view ${item.title || item.size} product page`}
                                               >
                                                 {item.title || item.size} <ExternalLink className="w-3 h-3 text-stone-400 inline" />
                                               </Link>
                                             </span>
                                             {(order.status === 'CANCELLED' || order.status === 'Cancelled') && (
                                               <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                                 Cancelled Product
                                               </span>
                                             )}
                                           </li>
                                         );
                                       })}
                                     </ul>
                                   </div>

                                   {(order.status === 'CANCELLED' || order.status === 'Cancelled') && (
                                     <div className="mt-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                                       <div className="flex items-center gap-1.5 font-bold text-red-700 uppercase tracking-wider mb-1">
                                         <XCircle className="w-4 h-4 text-red-600 shrink-0" /> Order Cancelled by Customer
                                       </div>
                                       {order.actionReason && (
                                         <p className="mt-1 text-stone-800">
                                           <span className="font-semibold text-red-950">Reason:</span> {order.actionReason}
                                         </p>
                                       )}
                                       {order.actionNotes && (
                                         <p className="mt-0.5 text-stone-700">
                                           <span className="font-semibold text-stone-900">Customer Note:</span> {order.actionNotes}
                                         </p>
                                       )}
                                     </div>
                                   )}
                                  
                                  {order.orderItems?.some((item: any) => item.userImage) && (
                                    <div className="mt-3">
                                      {order.orderItems.filter((item: any) => item.userImage).map((item: any, idx: number) => (
                                        <button 
                                          key={idx}
                                          onClick={() => setViewingCustomItem({ ...item, orderId: order._id })}
                                          className="w-full bg-stone-900 text-white rounded-xl py-2.5 px-3 text-xs font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mb-2 last:mb-0"
                                        >
                                          View Custom Photo ({item.title || item.size})
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="py-6 px-4 font-bold text-stone-900 text-lg">₹{order.totalPrice?.toFixed(2)}</td>
                                <td className="py-6 px-4">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider border border-stone-200">
                                    {order.paymentMethod || 'CARD'}
                                  </span>
                                </td>
                                <td className="py-6 px-4">
                                  {Boolean(order.isDelivered || String(order.status || '').toUpperCase() === 'DELIVERED' || String(order.status || '').toUpperCase() === 'CANCELLED') ? (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      String(order.status || '').toUpperCase() === 'CANCELLED'
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                      {String(order.status || '').toUpperCase() === 'CANCELLED' ? '✕ Cancelled' : '✓ Delivered'}
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <select 
                                        value={orderStatus} 
                                        onChange={(e) => setOrderStatuses({ ...orderStatuses, [order._id]: e.target.value })}
                                        className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-stone-900 transition-colors font-medium"
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                      <button 
                                        onClick={() => handleUpdateOrderStatusValue(order._id, orderStatus)}
                                        className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-white transition-colors"
                                        title="Save Status"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="py-6 px-4 text-stone-600 whitespace-pre-wrap">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(', ', ',\n')}
                                </td>
                                <td className="py-6 px-4 text-center">
                                  <div className="flex items-center justify-center gap-3">
                                    <button 
                                      onClick={() => handlePrintOrder(order)}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> Print
                                    </button>
                                    <button 
                                      onClick={() => handlePrintShippingBill(order)}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> Shipping Bill
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteOrder(order.orderId || order._id);
                                      }}
                                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {orders.filter(o => {
                            if (o.isReturned) return false;
                            if (o.actionReason || o.actionNotes || o.expectedReplacementDate || o.actionRequestedAt) return false;
                            if (Array.isArray(o.proofMedia) && o.proofMedia.length > 0) return false;
                            const s = String(o.status || '').toUpperCase().replace(/\s+/g, '_');
                            return !s.includes('RETURN') && !s.includes('REPLACE') && !s.includes('EXCHANGE') && !s.includes('REFUND');
                          }).length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-stone-500">No standard orders placed yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Returns & Replacement Tab */}
                {activeTab === 'returns' && (() => {
                  const returnOrders = orders.filter(o => {
                    if (o.isReturned) return true;
                    if (o.actionReason || o.actionNotes || o.expectedReplacementDate || o.actionRequestedAt) return true;
                    if (Array.isArray(o.proofMedia) && o.proofMedia.length > 0) return true;
                    const s = String(o.status || '').toUpperCase().replace(/\s+/g, '_');
                    return (
                      s.includes('RETURN') ||
                      s.includes('REPLACE') ||
                      s.includes('EXCHANGE') ||
                      s.includes('REFUND')
                    );
                  });

                  return (
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-medium">Returns & Exchange Requests</h2>
                          <p className="text-sm text-stone-500 mt-1">Manage return, replacement, and exchange requests submitted by customers.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700">
                          <RefreshCcw className="w-3.5 h-3.5" /> Total Requests: {returnOrders.length}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="pb-3 px-4">Order ID</th>
                              <th className="pb-3 px-4">Customer & Delivery</th>
                              <th className="pb-3 px-4">Request Type & Reason</th>
                              <th className="pb-3 px-4">Proof & Items</th>
                              <th className="pb-3 px-4">Amount</th>
                              <th className="pb-3 px-4 text-center">Status / Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {returnOrders.map(order => {
                              const rawStatus = String(order.status || '').toUpperCase().replace(/\s+/g, '_');
                              const currentStatus = orderStatuses[order._id] || order.status || (order.isReturned ? 'Returned' : 'RETURN_REQUESTED');

                              return (
                                <tr key={order._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors align-top">
                                  <td className="py-6 px-4 font-mono text-xs text-stone-900">
                                    <span className="font-bold text-stone-900">{order.orderId || order._id}</span>
                                    <p className="text-[11px] text-stone-500 mt-1">
                                      <span className="font-medium text-stone-600">Ordered:</span> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    {(order.actionRequestedAt || order.returnedAt || order.updatedAt) && (
                                      <p className="text-[10px] text-amber-900 font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                                        Requested: {new Date(order.actionRequestedAt || order.returnedAt || order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-6 px-4">
                                    <div className="font-bold text-stone-900 text-base">
                                      {order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest')}
                                    </div>
                                    <div className="text-stone-500 text-xs mb-3">{order.user?.email || order.shippingAddress?.email || ''}</div>

                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs space-y-1">
                                      <div className="flex items-center gap-1.5 text-stone-700">
                                        <Phone className="w-3 h-3 text-stone-400" /> <span className="font-medium">{order.shippingAddress?.phone || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-start gap-1.5 text-stone-700">
                                        <MapPin className="w-3 h-3 text-stone-400 mt-0.5" />
                                        <span>
                                          {order.shippingAddress?.address}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6 px-4">
                                    <div className="mb-2 flex flex-col gap-1 items-start">
                                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                        rawStatus === 'RETURNED' || order.isReturned ? 'bg-stone-200 text-stone-800 border border-stone-300' :
                                        rawStatus === 'REPLACEMENT_REQUESTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                        rawStatus === 'EXCHANGE_REQUESTED' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                        'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}>
                                        {order.status ? order.status.replace(/_/g, ' ') : 'RETURN REQUESTED'}
                                      </span>
                                      <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mt-1 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                                        <Clock className="w-3 h-3 text-stone-500" /> Requested: {new Date(order.actionRequestedAt || order.returnedAt || order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    </div>

                                    {order.actionReason && (
                                      <div className="mt-2 text-xs text-stone-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                                        <p className="font-bold text-amber-950 text-[11px] uppercase tracking-wider">Reason:</p>
                                        <p className="text-amber-900 mt-0.5">{order.actionReason}</p>
                                      </div>
                                    )}

                                    {order.actionNotes && (
                                      <div className="mt-1.5 text-xs text-stone-600 italic">
                                        "{order.actionNotes}"
                                      </div>
                                    )}

                                    {order.expectedReplacementDate && (
                                      <div className="mt-2.5 text-xs text-blue-900 bg-blue-50/90 p-2.5 rounded-xl border border-blue-200 shadow-2xs">
                                        <p className="font-bold text-blue-950 text-[10px] uppercase tracking-wider flex items-center gap-1">
                                          <Truck className="w-3.5 h-3.5 text-blue-600" /> Target Replacement Delivery Date:
                                        </p>
                                        <p className="text-blue-900 font-extrabold mt-0.5 text-xs">
                                          {new Date(order.expectedReplacementDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-6 px-4">
                                    {/* Order items summary */}
                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs mb-3">
                                      <div className="font-bold text-stone-800 mb-1.5">Items:</div>
                                      <ul className="space-y-1.5">
                                        {order.orderItems?.map((item: any, i: number) => {
                                          const prodId = item.product || item.productId || item._id;
                                          const prodLink = prodId ? `/shop/${prodId}` : `/shop`;
                                          return (
                                            <li key={i} className="text-stone-700 flex items-center gap-1.5 flex-wrap">
                                              <span className="font-medium text-stone-600">{item.quantity}x</span>
                                              <Link
                                                href={prodLink}
                                                target="_blank"
                                                className="font-bold text-stone-900 hover:text-emerald-700 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                                                title={`Click to view ${item.title || item.size} product page`}
                                              >
                                                {item.title || item.size} <ExternalLink className="w-3 h-3 text-stone-400 inline" />
                                              </Link>
                                              <span className="text-stone-500 text-[11px]">(₹{item.price})</span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>

                                    {/* Customer Proof Media Attachments */}
                                    {order.proofMedia && order.proofMedia.length > 0 ? (
                                      <div>
                                        <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">Attached Proof Media ({order.proofMedia.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                          {order.proofMedia.map((url: string, pIdx: number) => (
                                            <a
                                              key={pIdx}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="w-12 h-12 rounded-lg border border-stone-300 overflow-hidden group relative hover:opacity-90 transition-opacity bg-stone-100 flex items-center justify-center shrink-0"
                                              title="Click to view full resolution proof media"
                                            >
                                              {url.match(/\.(mp4|webm|mov)$/i) ? (
                                                <span className="text-[9px] font-bold text-stone-700">VIDEO</span>
                                              ) : (
                                                <img src={url} alt={`Proof ${pIdx + 1}`} className="w-full h-full object-cover" />
                                              )}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-stone-400 italic">No proof media attached</span>
                                    )}
                                  </td>
                                  <td className="py-6 px-4 font-bold text-stone-900 text-lg">
                                    ₹{order.totalPrice?.toFixed(2)}
                                  </td>
                                  <td className="py-6 px-4 text-center">
                                    <div className="flex flex-col items-center gap-2 max-w-[210px]">
                                      {(() => {
                                        const statusUpper = String(order.status || '').toUpperCase();
                                        const isReplacementOrExchange = statusUpper.includes('REPLACE') || statusUpper.includes('EXCHANGE');
                                        const isActionCompleted = 
                                          statusUpper === 'REFUND_COMPLETED' || 
                                          statusUpper === 'RETURNED' || 
                                          statusUpper === 'RETURN_REJECTED' || 
                                          statusUpper === 'CANCEL_RETURN' || 
                                          statusUpper === 'REPLACEMENT_REJECTED' || 
                                          statusUpper === 'EXCHANGE_REJECTED' || 
                                          statusUpper === 'CANCEL_REPLACEMENT' || 
                                          statusUpper === 'CANCELLED' || 
                                          statusUpper === 'DELIVERED' ||
                                          Boolean(order.isReturned && statusUpper !== 'RETURN_REQUESTED');

                                        if (isActionCompleted) {
                                          return (
                                            <div className="w-full text-center py-2">
                                              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                statusUpper.includes('REJECT') || statusUpper.includes('CANCEL')
                                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                                  : statusUpper === 'REFUND_COMPLETED' || statusUpper === 'RETURNED'
                                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                  : statusUpper === 'DELIVERED'
                                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                                              }`}>
                                                {statusUpper.includes('REJECT') || statusUpper.includes('CANCEL')
                                                  ? '✕ Request Cancelled / Rejected'
                                                  : statusUpper === 'REFUND_COMPLETED' || statusUpper === 'RETURNED'
                                                  ? '✅ Refund Completed'
                                                  : statusUpper === 'DELIVERED'
                                                  ? '✓ Delivered'
                                                  : order.status?.replace(/_/g, ' ')}
                                              </span>
                                            </div>
                                          );
                                        }

                                        return (
                                          <>
                                            <div className="flex items-center gap-1.5 w-full">
                                              <select 
                                                value={currentStatus} 
                                                onChange={(e) => {
                                                  const newStatus = e.target.value;
                                                  setOrderStatuses({ ...orderStatuses, [order._id]: newStatus });
                                                  handleUpdateOrderStatusValue(order._id, newStatus);
                                                }}
                                                className="border border-stone-200 rounded-lg px-2.5 py-1 text-xs bg-white outline-none focus:border-stone-900 transition-colors w-full font-medium"
                                              >
                                                {isReplacementOrExchange ? (
                                                  <>
                                                    <option value="REPLACEMENT_REQUESTED">Replacement / Exchange Requested</option>
                                                    <option value="REPLACEMENT_ACCEPTED">✓ Accept Replacement / Exchange</option>
                                                    <option value="REPLACEMENT_REJECTED">✕ Cancel / Reject Replacement / Exchange</option>
                                                  </>
                                                ) : (
                                                  <>
                                                    <option value="RETURN_REQUESTED">Return Requested</option>
                                                    <option value="RETURN_ACCEPTED">✓ Accept Return</option>
                                                    <option value="RETURN_REJECTED">✕ Cancel / Reject Return</option>
                                                    <option value="REFUND_INITIATED">Refund Initiated</option>
                                                    <option value="REFUND_COMPLETED">Refund Completed / Refund Successful</option>
                                                  </>
                                                )}
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                              </select>
                                            </div>

                                            <div className="flex flex-col gap-1 w-full mt-1">
                                              {isReplacementOrExchange ? (
                                                <>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'REPLACEMENT_ACCEPTED')}
                                                    className="w-full px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center justify-center gap-1"
                                                    title="Accept Replacement or Exchange Request"
                                                  >
                                                    <Check className="w-3 h-3" /> Accept Replace / Exchange
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'REPLACEMENT_REJECTED')}
                                                    className="w-full px-2.5 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                                                    title="Cancel / Reject Replacement Request"
                                                  >
                                                    <XCircle className="w-3 h-3" /> Cancel Replace / Exchange
                                                  </button>
                                                </>
                                              ) : (
                                                <>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'RETURN_ACCEPTED')}
                                                    className="w-full px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center justify-center gap-1"
                                                    title="Accept Return Request"
                                                  >
                                                    <Check className="w-3 h-3" /> Accept Return
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'RETURN_REJECTED')}
                                                    className="w-full px-2.5 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                                                    title="Cancel / Reject Return Request"
                                                  >
                                                    <XCircle className="w-3 h-3" /> Cancel Return
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'REFUND_INITIATED')}
                                                    className="w-full px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center justify-center gap-1"
                                                    title="Mark Refund Initiated"
                                                  >
                                                    💸 Refund Initiated
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateOrderStatusValue(order._id || order.orderId, 'REFUND_COMPLETED')}
                                                    className="w-full px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center justify-center gap-1"
                                                    title="Mark Refund Completed / Successful"
                                                  >
                                                    ✅ Refund Completed
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </>
                                        );
                                      })()}

                                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100 w-full justify-center">
                                        <button 
                                          onClick={() => handlePrintOrder(order)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                        >
                                          <Printer className="w-3 h-3" /> Print
                                        </button>
                                        <button 
                                          onClick={() => handlePrintShippingBill(order)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                        >
                                          <Printer className="w-3 h-3" /> Shipping Bill
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteOrder(order.orderId || order._id)}
                                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                          title="Delete Order"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                            {returnOrders.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-stone-500">
                                  <RefreshCcw className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                  No return, replacement, or exchange requests found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Cancelled Orders Tab */}
                {activeTab === 'cancelled-orders' && (() => {
                  const cancelledOrders = orders.filter(o => {
                    const s = String(o.status || '').toUpperCase().replace(/\s+/g, '_');
                    return s === 'CANCELLED' || s === 'CANCEL_ORDER' || o.status === 'Cancelled';
                  });

                  return (
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-medium text-stone-900">Cancelled Orders</h2>
                          <p className="text-sm text-stone-500 mt-1">View all orders cancelled by customers or administrators.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-red-200">
                          <XCircle className="w-4 h-4 text-red-600" /> Total Cancelled: {cancelledOrders.length}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="pb-3 px-4">Order ID & Date</th>
                              <th className="pb-3 px-4">Customer Details</th>
                              <th className="pb-3 px-4">Cancellation Reason</th>
                              <th className="pb-3 px-4">Cancelled Items</th>
                              <th className="pb-3 px-4">Amount</th>
                              <th className="pb-3 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {cancelledOrders.map(order => (
                              <tr key={order._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors align-top">
                                <td className="py-6 px-4 font-mono text-xs text-stone-900">
                                  <span className="font-bold text-stone-900 text-sm block">{order.orderId || order._id}</span>
                                  <p className="text-[11px] text-stone-500 mt-1">
                                    Placed: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                  <span className="mt-2 inline-flex flex-col items-start gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                    <span className="uppercase tracking-wider font-extrabold flex items-center gap-1">✕ Cancelled</span>
                                    <span className="text-[10px] font-normal text-red-600">
                                      on {new Date(order.cancelledAt || order.updatedAt || order.actionRequestedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </span>
                                </td>

                                <td className="py-6 px-4">
                                  <div className="font-bold text-stone-900 text-base">
                                    {order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest')}
                                  </div>
                                  <div className="text-stone-500 text-xs mb-3">{order.user?.email || order.shippingAddress?.email || ''}</div>

                                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 text-stone-700">
                                      <Phone className="w-3 h-3 text-stone-400" /> <span className="font-medium">{order.shippingAddress?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-stone-700">
                                      <MapPin className="w-3 h-3 text-stone-400 mt-0.5" />
                                      <span>
                                        {order.shippingAddress?.address}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-6 px-4">
                                  <div className="p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-950">
                                    <p className="font-bold text-red-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                      <XCircle className="w-3.5 h-3.5 text-red-600" /> Cancellation Reason:
                                    </p>
                                    <p className="mt-1 text-stone-800 font-medium">
                                      {order.actionReason || order.adminRejectionReason || 'Cancelled by Customer'}
                                    </p>
                                    {order.actionNotes && (
                                      <p className="mt-1 text-stone-600 italic">
                                        "{order.actionNotes}"
                                      </p>
                                    )}
                                  </div>
                                </td>

                                <td className="py-6 px-4">
                                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs">
                                    <div className="font-bold text-stone-800 mb-1.5">Items:</div>
                                    <ul className="space-y-1.5">
                                      {order.orderItems?.map((item: any, i: number) => {
                                        const prodId = item.product || item.productId || item._id;
                                        const prodLink = prodId ? `/shop/${prodId}` : `/shop`;
                                        return (
                                          <li key={i} className="text-stone-700 flex items-center gap-1.5 flex-wrap">
                                            <span className="font-medium text-stone-600">{item.quantity}x</span>
                                            <Link
                                              href={prodLink}
                                              target="_blank"
                                              className="font-bold text-stone-900 hover:text-red-700 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                                              title={`Click to view ${item.title || item.size} product page`}
                                            >
                                              {item.title || item.size} <ExternalLink className="w-3 h-3 text-stone-400 inline" />
                                            </Link>
                                            <span className="text-stone-500 text-[11px]">(₹{item.price})</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                </td>

                                <td className="py-6 px-4 font-bold text-stone-900 text-lg">
                                  ₹{order.totalPrice?.toFixed(2)}
                                </td>

                                <td className="py-6 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => handlePrintOrder(order)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> Print
                                    </button>
                                    <button 
                                      onClick={() => handlePrintShippingBill(order)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" /> Shipping Bill
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.orderId || order._id)}
                                      className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                      title="Delete Order Record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {cancelledOrders.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-stone-500">
                                  <XCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                  No cancelled orders found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Customer Reviews Moderation Tab */}
                {activeTab === 'reviews' && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100">
                      <div>
                        <h2 className="text-2xl font-bold text-stone-900">Customer Reviews & Moderation</h2>
                        <p className="text-xs text-stone-500 mt-1">Approve, reject, or delete customer reviews before they are displayed publicly</p>
                      </div>

                      {/* Filter Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'ALL', label: 'All Reviews' },
                          { id: 'PENDING', label: 'Pending Approval' },
                          { id: 'APPROVED', label: 'Approved' },
                          { id: 'REJECTED', label: 'Rejected' },
                        ].map((f) => {
                          const count = f.id === 'ALL'
                            ? adminReviews.length
                            : adminReviews.filter(r => r.status === f.id).length;
                          return (
                            <button
                              key={f.id}
                              onClick={() => setReviewFilter(f.id as any)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                                reviewFilter === f.id
                                  ? 'bg-stone-900 text-white shadow-xs'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {f.label}
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                reviewFilter === f.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {adminReviews.map((rev) => {
                        const prod = rev.productId;
                        const statusBg =
                          rev.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rev.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200';

                        return (
                          <div key={rev._id} className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-colors shadow-xs">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              {/* Product & User Info */}
                              <div className="flex items-start gap-4">
                                {prod?.image || (prod?.images && prod.images[0]) ? (
                                  <img
                                    src={prod?.images ? prod.images[0] : prod.image}
                                    alt={prod?.title || 'Product'}
                                    className="w-14 h-14 rounded-xl object-cover border border-stone-100 shrink-0 bg-stone-50"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-400 shrink-0">
                                    No Img
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-stone-900 text-base">{rev.userName}</span>
                                    {rev.userEmail && <span className="text-xs text-stone-400">({rev.userEmail})</span>}
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusBg}`}>
                                      {rev.status}
                                    </span>
                                  </div>

                                  <p className="text-xs font-semibold text-stone-500 mt-0.5">
                                    Product: <span className="text-stone-800 font-bold">{prod?.title || 'Unknown Product'}</span>
                                  </p>

                                  <div className="flex items-center gap-1 my-1.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                                    ))}
                                    <span className="text-xs font-bold text-stone-700 ml-1">{rev.rating}.0 / 5</span>
                                    <span className="text-xs text-stone-400 ml-2">
                                      • {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  {rev.title && <h4 className="font-bold text-stone-900 text-sm">{rev.title}</h4>}
                                  <p className="text-sm text-stone-700 mt-1 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">{rev.comment}</p>

                                  {/* Media Attachments */}
                                  {rev.media && rev.media.length > 0 && (
                                    <div className="flex flex-wrap gap-2.5 mt-3">
                                      {rev.media.map((med: any, idx: number) => (
                                        <div
                                          key={idx}
                                          onClick={() => setAdminMediaPreview(med)}
                                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-900 cursor-pointer hover:opacity-90 transition-opacity"
                                        >
                                          {med.type === 'video' ? (
                                            <video src={med.url} className="w-full h-full object-cover opacity-80" />
                                          ) : (
                                            <img src={med.url} alt="Review upload" className="w-full h-full object-cover" />
                                          )}
                                          {med.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <Play className="w-4 h-4 fill-white text-white drop-shadow-md" />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end lg:self-start">
                                {rev.status !== 'APPROVED' && (
                                  <button
                                    onClick={() => handleUpdateReviewStatus(rev._id, 'APPROVED')}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                    title="Approve and publish customer review"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                  </button>
                                )}

                                {rev.status !== 'REJECTED' && (
                                  <button
                                    onClick={() => handleUpdateReviewStatus(rev._id, 'REJECTED')}
                                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                    title="Reject review"
                                  >
                                    <XCircle className="w-4 h-4" /> Reject
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                  title="Delete review permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {adminReviews.length === 0 && (
                        <div className="py-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                          <Star className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                          <p className="font-bold text-stone-700">No customer reviews found</p>
                          <p className="text-xs text-stone-400 mt-1">Submitted reviews will appear here for admin moderation.</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Media Lightbox Modal */}
                    {adminMediaPreview && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="relative max-w-3xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2">
                          <button
                            onClick={() => setAdminMediaPreview(null)}
                            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                          {adminMediaPreview.type === 'video' ? (
                            <video src={adminMediaPreview.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl" />
                          ) : (
                            <img src={adminMediaPreview.url} alt="Admin review preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-medium">Registered Users</h2>
                      {user?.role === 'SUPER_ADMIN' && (
                        <button 
                          onClick={() => setShowAddAdmin(!showAddAdmin)}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors"
                        >
                          {showAddAdmin ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {showAddAdmin ? 'Cancel' : 'New Admin'}
                        </button>
                      )}
                    </div>

                    {showAddAdmin && user?.role === 'SUPER_ADMIN' && (
                      <div className="mb-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="font-medium mb-4">Create Administrator Account</h3>
                        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input required type="text" value={newAdmin.firstName} onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text" value={newAdmin.lastName} onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email Address</label>
                            <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div className="md:col-span-2 mt-2">
                            <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors">Create Admin</button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-sm text-stone-500">
                            <th className="pb-3 font-medium">Name</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Role</th>
                            <th className="pb-3 font-medium">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {users.map(u => (
                            <tr key={u._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                              <td className="py-4 font-medium">{u.firstName} {u.lastName}</td>
                              <td className="py-4 text-stone-500">{u.email}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                  u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-stone-100 text-stone-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4 text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-medium">My Account Profile</h2>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminChangePw(!showAdminChangePw);
                            if (isEditingProfile) setIsEditingProfile(false);
                          }}
                          className="flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm hover:bg-stone-200 transition-colors font-medium cursor-pointer"
                        >
                          {showAdminChangePw ? <XCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {showAdminChangePw ? 'Cancel Password Change' : 'Change Password'}
                        </button>
                        <button 
                          onClick={() => {
                            if (isEditingProfile) {
                              setProfileData({
                                name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                                email: user?.email || '',
                                phone: user?.phone || '',
                                profilePhoto: user?.profilePhoto || ''
                              });
                            }
                            if (showAdminChangePw) setShowAdminChangePw(false);
                            setIsEditingProfile(!isEditingProfile);
                          }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors font-medium cursor-pointer"
                        >
                          {isEditingProfile ? <XCircle className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                      </div>
                    </div>

                    {/* Change Password Top Form Dropdown */}
                    {showAdminChangePw && (
                      <form onSubmit={handleAdminChangePassword} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mb-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xl">
                        <h4 className="text-base font-bold text-stone-900 border-b border-stone-200/80 pb-2">Change Password</h4>
                        {adminPwMsg.text && (
                          <div className={`p-3 rounded-lg text-xs font-semibold ${adminPwMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {adminPwMsg.text}
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Current Password</label>
                          <input
                            required
                            type="password"
                            placeholder="Enter current password"
                            value={adminCurrentPw}
                            onChange={(e) => setAdminCurrentPw(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-900 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
                            <input
                              required
                              type="password"
                              placeholder="Min. 6 characters"
                              value={adminNewPw}
                              onChange={(e) => setAdminNewPw(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
                            <input
                              required
                              type="password"
                              placeholder="Confirm new password"
                              value={adminConfirmPw}
                              onChange={(e) => setAdminConfirmPw(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-900 text-sm"
                            />
                          </div>
                        </div>
                        <div className="pt-2 flex gap-3">
                          <button
                            type="submit"
                            disabled={updatingAdminPw}
                            className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {updatingAdminPw ? 'Updating Password...' : 'Save New Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAdminChangePw(false)}
                            className="bg-stone-200 text-stone-700 px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-stone-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                    
                    <div className="max-w-xl">
                      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
                        <div className="relative group overflow-hidden rounded-full shrink-0">
                          {(isEditingProfile ? profileData.profilePhoto : user?.profilePhoto) ? (
                            <img 
                              src={(isEditingProfile ? profileData.profilePhoto : user?.profilePhoto) || ''} 
                              alt="Profile" 
                              className="w-24 h-24 rounded-full object-cover border border-stone-200 bg-stone-100" 
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-4xl uppercase">
                              {user?.firstName?.charAt(0)}
                            </div>
                          )}
                          {isEditingProfile && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                              <ImageIcon className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-medium uppercase tracking-wider">{isUploadingProfilePhoto ? 'Uploading...' : 'Change'}</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleProfilePhotoUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploadingProfilePhoto}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin User'}</h3>
                          <p className="text-stone-500">{user?.email}</p>
                          <span className="inline-block mt-2 px-3 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-md">
                            {user?.role}
                          </span>
                        </div>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Name</label>
                            <input 
                              required 
                              type="text" 
                              placeholder="Full Name"
                              value={profileData.name} 
                              onChange={e => setProfileData({...profileData, name: e.target.value})} 
                              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Login Email Address</label>
                            <input 
                              required 
                              type="email" 
                              placeholder="admin@example.com"
                              value={profileData.email} 
                              onChange={e => setProfileData({...profileData, email: e.target.value})} 
                              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Login Phone Number</label>
                            <input 
                              type="text" 
                              placeholder="e.g. +91 9876543210"
                              value={profileData.phone} 
                              onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 outline-none focus:border-stone-900" 
                            />
                          </div>
                          <button type="submit" className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">Save Changes</button>
                        </form>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Name</label>
                            <p className="font-medium text-stone-900">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Login Email Address</label>
                            <p className="font-medium text-stone-900">{user?.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Login Phone Number</label>
                            <p className="font-medium text-stone-900">{user?.phone || 'Not set'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-stone-500">Account Type</label>
                            <p className="font-medium text-stone-900">{user?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Locations Tab */}
                {activeTab === 'delivery' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Add Locations Form */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-stone-900" />
                          <h2 className="text-xl font-bold text-stone-900">Add Locations</h2>
                        </div>
                        
                        <form onSubmit={handleUpdateDeliveryMap} className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-stone-700">Standard Delivery Pincodes</label>
                            <textarea 
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-stone-900 resize-none font-mono text-sm"
                              placeholder="Standard locations..."
                              value={standardPincodes}
                              onChange={(e) => setStandardPincodes(e.target.value)}
                            ></textarea>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold flex items-center gap-1.5 text-emerald-600">
                              <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" /> Free Delivery Pincodes
                            </label>
                            <textarea 
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-emerald-400 outline-none focus:border-emerald-500 resize-none font-mono text-sm bg-emerald-50/30"
                              placeholder="Free delivery locations..."
                              value={freePincodes}
                              onChange={(e) => setFreePincodes(e.target.value)}
                            ></textarea>
                            <p className="text-xs font-semibold text-emerald-700">* Delivery charges will be ₹0 for these locations.</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold flex items-center gap-1.5 text-[#907341]">
                              <Zap className="w-4 h-4 fill-[#907341] text-[#907341]" /> Same Day Delivery Pincodes
                            </label>
                            <textarea 
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-[#ebdcc2] outline-none focus:border-[#907341] resize-none font-mono text-sm bg-[#FDFBF7]"
                              placeholder="Same day delivery locations..."
                              value={sameDayPincodes}
                              onChange={(e) => setSameDayPincodes(e.target.value)}
                            ></textarea>
                            <p className="text-xs font-semibold text-[#907341]">* These locations will support same-day express delivery.</p>
                          </div>
                          
                          <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-semibold transition-colors mt-2">
                            Update Delivery Map
                          </button>
                        </form>
                      </div>
                      
                      {/* Active Service Map */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-center mb-12">
                          <div className="flex items-center gap-2">
                            <List className="w-5 h-5 text-stone-500" />
                            <h2 className="text-xl font-bold text-stone-900">Active Service Map</h2>
                          </div>
                          <div className="flex items-center gap-3">
                            {isSearchOpen ? (
                              <div className="flex items-center bg-white border border-stone-200 rounded-lg focus-within:border-stone-400 transition-colors pr-1">
                                <Search className="w-4 h-4 text-stone-400 ml-2 shrink-0" />
                                <input 
                                  type="text"
                                  value={searchQuery}
                                  onChange={e => setSearchQuery(e.target.value)}
                                  placeholder="Search..."
                                  className="px-2 py-1 text-sm outline-none w-24 sm:w-32 bg-transparent"
                                  autoFocus
                                />
                                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 text-stone-400 hover:text-stone-600 shrink-0">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setIsSearchOpen(true)} className="text-stone-400 hover:text-stone-700 transition-colors bg-stone-100 p-1.5 rounded-full">
                                <Search className="w-4 h-4" />
                              </button>
                            )}
                            <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full">
                              {activePincodes.length} Areas Active
                            </span>
                          </div>
                        </div>
                        
                        {activePincodes.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-12">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-100">
                              <MapPin className="w-8 h-8 text-stone-300" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-700 mb-2">No active service areas</h3>
                            <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
                              Start adding pincodes on the left to activate delivery validation.
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max items-start content-start overflow-y-auto max-h-[500px] pr-2">
                            {activePincodes.filter(pin => pin.code.includes(searchQuery)).map((pin) => (
                              <div 
                                key={pin.code} 
                                className={`flex justify-between items-start p-4 rounded-xl border ${
                                  pin.type === 'free' 
                                    ? 'bg-emerald-50/50 border-emerald-500/50' 
                                    : pin.type === 'sameday'
                                      ? 'bg-amber-50/50 border-amber-500/50'
                                      : 'bg-stone-50 border-stone-200'
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-stone-900">{pin.code}</span>
                                  {pin.type === 'free' && (
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Free Delivery</span>
                                  )}
                                  {pin.type === 'sameday' && (
                                    <span className="text-[10px] font-bold text-[#907341] uppercase tracking-wider">Same Day Delivery</span>
                                  )}
                                </div>
                                <button 
                                  onClick={() => handleDeletePincode(pin.code)}
                                  className="text-stone-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Return Address Section */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-6 mt-8">
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-stone-900" />
                        <h2 className="text-xl font-bold text-stone-900">Shipping Bill Return Address</h2>
                      </div>
                      
                      <form onSubmit={handleUpdateReturnAddress} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Company / Sender Name</label>
                          <input 
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-stone-900 text-sm"
                            placeholder="e.g. PIKS MEDIA INDUSTRIES-"
                            value={returnAddress.companyName || ''}
                            onChange={(e) => setReturnAddress(prev => ({ ...prev, companyName: e.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Address Line 1</label>
                          <input 
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-stone-900 text-sm"
                            placeholder="e.g. 75C DLF Industrial Area Phase 1"
                            value={returnAddress.addressLine1 || ''}
                            onChange={(e) => setReturnAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Address Line 2 (City, State, Zip, Country)</label>
                          <input 
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-stone-900 text-sm"
                            placeholder="e.g. Faridabad Haryana 121003, India"
                            value={returnAddress.addressLine2 || ''}
                            onChange={(e) => setReturnAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                          />
                        </div>
                        
                        <div className="md:col-span-3 flex justify-end">
                          <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                            Save Return Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Hero Images Tab */}
                {activeTab === 'hero' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-medium">Hero Images Management</h2>
                        <p className="text-stone-500 mt-1">Update the 20 images displayed in the rotating hero section.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleUpdateHeroImages} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {heroImages.map((img, index) => (
                          <div key={index} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col gap-3">
                            <label className="text-sm font-medium text-stone-700 flex justify-between items-center">
                              Image {index + 1}
                              {img && (
                                <a href={img} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                  Preview
                                </a>
                              )}
                            </label>
                            {img && (
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                                <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            )}

                            
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(index, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploadingImageIndex === index}
                              />
                              <button type="button" className="w-full px-3 py-2 text-xs font-medium bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors">
                                {uploadingImageIndex === index ? 'Uploading...' : 'Upload from Device'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-4 border-t border-stone-100">
                        <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-md">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {/* Landing Pages Tab */}
                {activeTab === 'landing' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-medium">Landing Page Images</h2>
                        <p className="text-stone-500 mt-1">Manage the images used in various sections of the landing page.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleUpdateLandingPageImages} className="space-y-12">
                      {/* Curation Section */}
                      <div>
                        <h3 className="text-xl font-medium border-b border-stone-100 pb-2 mb-4">Curation Section (4 Images)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {landingPageImages.curation.map((img, index) => (
                            <div key={`curation-${index}`} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col gap-3">
                              <label className="text-sm font-medium text-stone-700 flex justify-between items-center">
                                Image {index + 1}
                                {img && <a href={img} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Preview</a>}
                              </label>
                              {img && (
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                                  <img src={img} alt={`Curation ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                              )}

                              <div className="relative">
                                <input type="file" accept="image/*" onChange={(e) => handleLandingFileUpload('curation', index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingLandingImage?.section === 'curation' && uploadingLandingImage?.index === index} />
                                <button type="button" className="w-full px-3 py-2 text-xs font-medium bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors">
                                  {uploadingLandingImage?.section === 'curation' && uploadingLandingImage?.index === index ? 'Uploading...' : 'Upload Image'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Best Sellers Section */}
                      <div>
                        <h3 className="text-xl font-medium border-b border-stone-100 pb-2 mb-4">Best Sellers Section (3 Images)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {landingPageImages.bestSellers.map((img, index) => (
                            <div key={`bestSellers-${index}`} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col gap-3">
                              <label className="text-sm font-medium text-stone-700 flex justify-between items-center">
                                Image {index + 1}
                                {img && <a href={img} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Preview</a>}
                              </label>
                              {img && (
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                                  <img src={img} alt={`Best Seller ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                              )}

                              <div className="relative">
                                <input type="file" accept="image/*" onChange={(e) => handleLandingFileUpload('bestSellers', index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingLandingImage?.section === 'bestSellers' && uploadingLandingImage?.index === index} />
                                <button type="button" className="w-full px-3 py-2 text-xs font-medium bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors">
                                  {uploadingLandingImage?.section === 'bestSellers' && uploadingLandingImage?.index === index ? 'Uploading...' : 'Upload Image'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Community Collective Section */}
                      <div>
                        <h3 className="text-xl font-medium border-b border-stone-100 pb-2 mb-4">Community Collective Section (5 Images)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                          {landingPageImages.community.map((img, index) => (
                            <div key={`community-${index}`} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col gap-3">
                              <label className="text-sm font-medium text-stone-700 flex justify-between items-center">
                                Image {index + 1}
                                {img && <a href={img} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Preview</a>}
                              </label>
                              {img && (
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                                  <img src={img} alt={`Community ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                              )}

                              <div className="relative">
                                <input type="file" accept="image/*" onChange={(e) => handleLandingFileUpload('community', index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingLandingImage?.section === 'community' && uploadingLandingImage?.index === index} />
                                <button type="button" className="w-full px-3 py-2 text-xs font-medium bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors">
                                  {uploadingLandingImage?.section === 'community' && uploadingLandingImage?.index === index ? 'Uploading...' : 'Upload Image'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-stone-100">
                        <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-md">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-stone-900">Manage Testimonials</h2>
                      <button onClick={() => {
                        setNewTestimonial({ authorName: '', text: '', rating: 5, verified: true, initials: '' });
                        setShowAddTestimonial(true);
                      }} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
                        <Plus className="w-4 h-4" /> Add Testimonial
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {testimonials.length === 0 ? (
                        <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                          No testimonials added yet. Click "Add Testimonial" to start.
                        </div>
                      ) : (
                        <div className="grid gap-6">
                          {testimonials.map((t, index) => (
                            <div key={t.id} className="bg-stone-50 p-6 rounded-xl border border-stone-200 relative">
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button type="button" onClick={() => {
                                  handleUpdateTestimonials();
                                }} className="text-stone-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg" title="Save Testimonial">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => {
                                  const newTestimonials = [...testimonials];
                                  newTestimonials.splice(index, 1);
                                  setTestimonials(newTestimonials);
                                  handleUpdateTestimonials(newTestimonials);
                                }} className="text-stone-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg" title="Delete Testimonial">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-12">
                                <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">Author Name</label>
                                  <input required type="text" value={t.authorName} onChange={e => {
                                    const newTestimonials = [...testimonials];
                                    newTestimonials[index].authorName = e.target.value;
                                    setTestimonials(newTestimonials);
                                  }} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">Initials (Avatar)</label>
                                  <input required type="text" maxLength={2} value={t.initials} onChange={e => {
                                    const newTestimonials = [...testimonials];
                                    newTestimonials[index].initials = e.target.value.toUpperCase();
                                    setTestimonials(newTestimonials);
                                  }} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Review Text</label>
                                <textarea required rows={3} value={t.text} onChange={e => {
                                  const newTestimonials = [...testimonials];
                                  newTestimonials[index].text = e.target.value;
                                  setTestimonials(newTestimonials);
                                }} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors resize-none" />
                              </div>

                              <div className="flex items-center gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
                                  <select value={t.rating} onChange={e => {
                                    const newTestimonials = [...testimonials];
                                    newTestimonials[index].rating = Number(e.target.value);
                                    setTestimonials(newTestimonials);
                                  }} className="px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white">
                                    {[1, 2, 3, 4, 5].map(num => (
                                      <option key={num} value={num}>{num} Stars</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                  <input type="checkbox" id={`verified-${t.id}`} checked={t.verified} onChange={e => {
                                    const newTestimonials = [...testimonials];
                                    newTestimonials[index].verified = e.target.checked;
                                    setTestimonials(newTestimonials);
                                  }} className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                                  <label htmlFor={`verified-${t.id}`} className="text-sm font-medium text-stone-700 cursor-pointer">Verified Buyer</label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Settings Tab */}
                {activeTab === 'footer' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-medium">Footer Settings</h2>
                      <button 
                        onClick={handleUpdateFooterSettings}
                        className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Brand Info */}
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Brand Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Brand Name</label>
                            <input type="text" value={footerSettings.brand?.name || ''} onChange={e => setFooterSettings({...footerSettings, brand: {...footerSettings.brand, name: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                            <input type="email" value={footerSettings.brand?.email || ''} onChange={e => setFooterSettings({...footerSettings, brand: {...footerSettings.brand, email: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                            <input type="text" value={footerSettings.brand?.phone || ''} onChange={e => setFooterSettings({...footerSettings, brand: {...footerSettings.brand, phone: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                            <textarea rows={2} value={footerSettings.brand?.address || ''} onChange={e => setFooterSettings({...footerSettings, brand: {...footerSettings.brand, address: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                            <textarea rows={2} value={footerSettings.brand?.description || ''} onChange={e => setFooterSettings({...footerSettings, brand: {...footerSettings.brand, description: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                        </div>
                      </div>

                      {/* Socials */}
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Twitter URL</label>
                            <input type="text" value={footerSettings.socials?.twitter || ''} onChange={e => setFooterSettings({...footerSettings, socials: {...footerSettings.socials, twitter: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Instagram URL</label>
                            <input type="text" value={footerSettings.socials?.instagram || ''} onChange={e => setFooterSettings({...footerSettings, socials: {...footerSettings.socials, instagram: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                          </div>
                        </div>
                      </div>
                      {/* Newsletter Section */}
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Newsletter Section</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                            <input type="text" value={footerSettings.newsletter?.title || ''} onChange={e => setFooterSettings({...footerSettings, newsletter: {...footerSettings.newsletter, title: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" placeholder="e.g. STAY IN THE LOOP" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                            <textarea rows={2} value={footerSettings.newsletter?.description || ''} onChange={e => setFooterSettings({...footerSettings, newsletter: {...footerSettings.newsletter, description: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900" placeholder="e.g. Subscribe for exclusive offers, inspiration, and 10% off your first order." />
                          </div>
                        </div>
                      </div>
                      {/* Link Groups */}
                      <div className="space-y-8">
                        {/* Shop Links */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-stone-900">Shop Links</h3>
                            <button onClick={() => setFooterSettings({...footerSettings, shopLinks: [...(footerSettings.shopLinks || []), {label: '', url: ''}]})} className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1">
                              <Plus className="w-4 h-4" /> Add Link
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(footerSettings.shopLinks || []).map((link: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input type="text" placeholder="Label" value={link.label} onChange={e => {
                                  const newLinks = [...footerSettings.shopLinks];
                                  newLinks[idx].label = e.target.value;
                                  setFooterSettings({...footerSettings, shopLinks: newLinks});
                                }} className="flex-1 px-3 py-2 rounded border border-stone-200 text-sm" />
                                <input type="text" placeholder="URL" value={link.url} onChange={e => {
                                  const newLinks = [...footerSettings.shopLinks];
                                  newLinks[idx].url = e.target.value;
                                  setFooterSettings({...footerSettings, shopLinks: newLinks});
                                }} className="flex-1 px-3 py-2 rounded border border-stone-200 text-sm" />
                                <button onClick={() => {
                                  const newLinks = footerSettings.shopLinks.filter((_: any, i: number) => i !== idx);
                                  setFooterSettings({...footerSettings, shopLinks: newLinks});
                                }} className="p-2 text-red-500 hover:bg-red-50 rounded shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Support Links */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-stone-900">Support Links</h3>
                            <button onClick={() => setFooterSettings({...footerSettings, supportLinks: [...(footerSettings.supportLinks || []), {label: '', url: ''}]})} className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1">
                              <Plus className="w-4 h-4" /> Add Link
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(footerSettings.supportLinks || []).map((link: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input type="text" placeholder="Label" value={link.label} onChange={e => {
                                  const newLinks = [...footerSettings.supportLinks];
                                  newLinks[idx].label = e.target.value;
                                  setFooterSettings({...footerSettings, supportLinks: newLinks});
                                }} className="flex-1 px-3 py-2 rounded border border-stone-200 text-sm" />
                                <input type="text" placeholder="URL" value={link.url} onChange={e => {
                                  const newLinks = [...footerSettings.supportLinks];
                                  newLinks[idx].url = e.target.value;
                                  setFooterSettings({...footerSettings, supportLinks: newLinks});
                                }} className="flex-1 px-3 py-2 rounded border border-stone-200 text-sm" />
                                <button onClick={() => {
                                  const newLinks = footerSettings.supportLinks.filter((_: any, i: number) => i !== idx);
                                  setFooterSettings({...footerSettings, supportLinks: newLinks});
                                }} className="p-2 text-red-500 hover:bg-red-50 rounded shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Why Us Tab */}
                {activeTab === 'why-us' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-medium">Why Us? Page Content & Media Settings</h2>
                        <p className="text-stone-500 mt-1 text-sm">Dynamically change all content, quotes, descriptions, and images for the Why Us? section.</p>
                      </div>
                      <button onClick={handleUpdateWhyUsSettings} className="px-6 py-2.5 bg-stone-900 text-white font-medium text-sm rounded-xl hover:bg-stone-800 transition-colors shadow-sm">
                        Save All Changes
                      </button>
                    </div>

                    <div className="space-y-10">
                      {/* Hero Section Settings */}
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Hero Header</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Tagline</label>
                            <input type="text" value={whyUsSettings.hero?.tagline || ''} onChange={e => setWhyUsSettings({...whyUsSettings, hero: {...(whyUsSettings.hero || {}), tagline: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 bg-white" placeholder="e.g. The Piks Advantage" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Title</label>
                            <input type="text" value={whyUsSettings.hero?.title || ''} onChange={e => setWhyUsSettings({...whyUsSettings, hero: {...(whyUsSettings.hero || {}), title: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 bg-white" placeholder="e.g. Why Piks Media?" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Description Paragraph</label>
                            <textarea rows={3} value={whyUsSettings.hero?.description || ''} onChange={e => setWhyUsSettings({...whyUsSettings, hero: {...(whyUsSettings.hero || {}), description: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 bg-white" placeholder="Hero description..." />
                          </div>
                        </div>
                      </div>

                      {/* Founder Quote Card Settings (Directly matches user screenshot) */}
                      <div className="p-6 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">Founder / CEO Quote Card Section</h3>
                          <span className="text-xs bg-stone-800 text-stone-300 px-3 py-1 rounded-full font-medium border border-stone-700">Dynamic Card</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-400 mb-1">Founder Quote Text</label>
                            <input type="text" value={whyUsSettings.founder?.quote || ''} onChange={e => setWhyUsSettings({...whyUsSettings, founder: {...(whyUsSettings.founder || {}), quote: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-white" placeholder='"Frames shouldn’t just hold pictures..."' />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-400 mb-1">Founder Story / Description</label>
                            <textarea rows={3} value={whyUsSettings.founder?.description || ''} onChange={e => setWhyUsSettings({...whyUsSettings, founder: {...(whyUsSettings.founder || {}), description: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-white" placeholder="Founder story paragraph..." />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase text-stone-400 mb-1">Founder Name</label>
                              <input type="text" value={whyUsSettings.founder?.name || ''} onChange={e => setWhyUsSettings({...whyUsSettings, founder: {...(whyUsSettings.founder || {}), name: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-white" placeholder="Name" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold uppercase text-stone-400 mb-1">Founder Role</label>
                              <input type="text" value={whyUsSettings.founder?.role || ''} onChange={e => setWhyUsSettings({...whyUsSettings, founder: {...(whyUsSettings.founder || {}), role: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-white" placeholder="Founder & CEO" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-400 mb-1">Founder Photo</label>
                            <div className="flex gap-3 items-center">
                              <label className="w-full text-center px-4 py-3 bg-stone-700 hover:bg-stone-600 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors shrink-0">
                                {uploadingWhyUsImage === 'founder.image' ? 'Uploading...' : 'Upload Photo from Device'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => handleWhyUsFileUpload('founder.image', e)} />
                              </label>
                            </div>
                            {whyUsSettings.founder?.image && (
                              <div className="mt-3 flex items-center gap-3">
                                <img src={whyUsSettings.founder.image} alt="Preview" className="w-16 h-20 object-cover rounded-lg border border-stone-700 shadow-sm" />
                                <span className="text-xs text-stone-400">Current Founder Photo Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Advantage Features (4 Cards) */}
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Advantage Feature Cards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(whyUsSettings.features && whyUsSettings.features.length > 0 ? whyUsSettings.features : [
                            { title: 'Imported & Handcrafted', description: 'Every single frame is imported from premier workshops...' },
                            { title: 'Hand-Drawn Artwork', description: 'All paintings and portrait sketches are 100% hand-drawn...' },
                            { title: 'Pincode Delivery', description: 'Enjoy verified delivery checking across major pincodes...' },
                            { title: 'Zero Risk Guarantee', description: 'If your frame or artwork arrives damaged...' }
                          ]).map((feat: any, idx: number) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                              <span className="text-xs font-bold text-stone-400 uppercase">Feature Card #{idx + 1}</span>
                              <input type="text" value={feat.title || ''} onChange={e => {
                                const currentFeats = whyUsSettings.features && whyUsSettings.features.length > 0 ? [...whyUsSettings.features] : [
                                  { title: 'Imported & Handcrafted', description: '' }, { title: 'Hand-Drawn Artwork', description: '' },
                                  { title: 'Pincode Delivery', description: '' }, { title: 'Zero Risk Guarantee', description: '' }
                                ];
                                currentFeats[idx] = { ...currentFeats[idx], title: e.target.value };
                                setWhyUsSettings({ ...whyUsSettings, features: currentFeats });
                              }} className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium" placeholder="Title" />
                              <textarea rows={2} value={feat.description || ''} onChange={e => {
                                const currentFeats = whyUsSettings.features && whyUsSettings.features.length > 0 ? [...whyUsSettings.features] : [
                                  { title: '', description: '' }, { title: '', description: '' },
                                  { title: '', description: '' }, { title: '', description: '' }
                                ];
                                currentFeats[idx] = { ...currentFeats[idx], description: e.target.value };
                                setWhyUsSettings({ ...whyUsSettings, features: currentFeats });
                              }} className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs" placeholder="Description" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Showcase Images */}
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Showcase Images</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Showcase Image 1 (Large Grid Image)</label>
                            <div className="flex gap-2 items-center">
                              <label className="w-full text-center px-3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors shrink-0">
                                {uploadingWhyUsImage === 'showcase.image1' ? 'Uploading...' : 'Upload Image from Device'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => handleWhyUsFileUpload('showcase.image1', e)} />
                              </label>
                            </div>
                            {whyUsSettings.showcase?.image1 && (
                              <img src={whyUsSettings.showcase.image1} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-stone-200 mt-2" />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Showcase Image 2 (Side Grid Image)</label>
                            <div className="flex gap-2 items-center">
                              <label className="w-full text-center px-3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors shrink-0">
                                {uploadingWhyUsImage === 'showcase.image2' ? 'Uploading...' : 'Upload Image from Device'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => handleWhyUsFileUpload('showcase.image2', e)} />
                              </label>
                            </div>
                            {whyUsSettings.showcase?.image2 && (
                              <img src={whyUsSettings.showcase.image2} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-stone-200 mt-2" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Core Values Cards (3 Cards) */}
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="text-lg font-bold text-stone-900 mb-4">Our Core Values Cards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(whyUsSettings.coreValues && whyUsSettings.coreValues.length > 0 ? whyUsSettings.coreValues : [
                            { title: 'Made with Love', description: 'Every frame is hand-assembled...' },
                            { title: 'Premium Quality', description: 'We source only the finest sustainable woods...' },
                            { title: 'Lifetime Guarantee', description: 'We stand by our craftsmanship...' }
                          ]).map((val: any, idx: number) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                              <span className="text-xs font-bold text-stone-400 uppercase">Core Value #{idx + 1}</span>
                              <input type="text" value={val.title || ''} onChange={e => {
                                const currentVals = whyUsSettings.coreValues && whyUsSettings.coreValues.length > 0 ? [...whyUsSettings.coreValues] : [
                                  { title: 'Made with Love', description: '' }, { title: 'Premium Quality', description: '' }, { title: 'Lifetime Guarantee', description: '' }
                                ];
                                currentVals[idx] = { ...currentVals[idx], title: e.target.value };
                                setWhyUsSettings({ ...whyUsSettings, coreValues: currentVals });
                              }} className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium" placeholder="Title" />
                              <textarea rows={3} value={val.description || ''} onChange={e => {
                                const currentVals = whyUsSettings.coreValues && whyUsSettings.coreValues.length > 0 ? [...whyUsSettings.coreValues] : [
                                  { title: '', description: '' }, { title: '', description: '' }, { title: '', description: '' }
                                ];
                                currentVals[idx] = { ...currentVals[idx], description: e.target.value };
                                setWhyUsSettings({ ...whyUsSettings, coreValues: currentVals });
                              }} className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs" placeholder="Description" />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Contact Requests Tab */}
                {activeTab === 'contact' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium">Contact Requests</h2>
                      <p className="text-stone-500 mt-2">Manage custom frame requests from customers.</p>
                    </div>

                    <div className="space-y-6">
                      {contactRequests.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
                          <p className="text-stone-500">No contact requests yet.</p>
                        </div>
                      ) : (
                        contactRequests.map((request, idx) => (
                          <div key={idx} className="p-6 border border-stone-200 rounded-xl bg-stone-50/50 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-stone-900">{request.name}</h3>
                                  <div className="text-sm text-stone-500 flex flex-wrap gap-4 mt-1">
                                    <span>{request.email}</span>
                                    <span>{request.mobile}</span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${request.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                  {request.status}
                                </span>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border border-stone-100">
                                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Requested Size</div>
                                <p className="text-sm text-stone-900">Width: {request.width} inches<br/>Height: {request.height} inches</p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-stone-100">
                                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Project Details</div>
                                <p className="text-sm text-stone-700 whitespace-pre-wrap">{request.details}</p>
                              </div>

                              {request.images && request.images.length > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-stone-100">
                                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Uploaded Images</div>
                                  <div className="flex flex-wrap gap-4">
                                    {request.images.map((img: string, imgIdx: number) => (
                                      <div key={imgIdx} className="relative group rounded-lg overflow-hidden border border-stone-200 w-24 h-24">
                                        <a href={img} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                          <img src={img} alt={`Upload ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                        </a>
                                        <button 
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            try {
                                              const response = await fetch(img);
                                              const blob = await response.blob();
                                              const url = window.URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = `upload_${request.id}_${imgIdx + 1}.jpg`;
                                              document.body.appendChild(a);
                                              a.click();
                                              window.URL.revokeObjectURL(url);
                                              document.body.removeChild(a);
                                            } catch (error) {
                                              toast.error('Failed to download image');
                                            }
                                          }}
                                          className="absolute top-1.5 right-1.5 z-10 bg-white p-1.5 rounded-md shadow-sm text-stone-700 hover:text-stone-900 transition-colors opacity-0 group-hover:opacity-100"
                                          title="Download Image"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="md:w-48 flex flex-col justify-start gap-3 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
                              <button onClick={() => {
                                const newReqs = contactRequests.map((r, i) => i === idx ? { ...r, status: 'read' } : r);
                                setContactRequests(newReqs);
                                localStorage.setItem('piks_contact_requests', JSON.stringify(newReqs));
                                toast.success('Marked as read');
                              }} className="w-full bg-white border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Mark Read
                              </button>
                              <a href={`mailto:${request.email}`} className="w-full bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                Reply
                              </a>
                              <button onClick={() => {
                                setContactRequestToDelete(idx);
                              }} className="w-full text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-auto">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Support Pages Tab */}
                {activeTab === 'support-pages' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium">Support Pages Content</h2>
                    </div>

                    <div className="space-y-12">
                      {/* FAQs Section */}
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div 
                          className="flex justify-between items-center mb-4 cursor-pointer"
                          onClick={() => setOpenSupportSection(openSupportSection === 'faqs' ? null : 'faqs')}
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-stone-900">FAQs Page</h3>
                            {openSupportSection === 'faqs' ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveSupportContent();
                            }}
                            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
                          >
                            Save FAQs
                          </button>
                        </div>
                        {openSupportSection === 'faqs' && (
                        <div className="space-y-8 mt-4">
                          {supportContent.faqs.map((cat: any, catIdx: number) => (
                            <div key={catIdx} className="bg-white p-4 rounded-xl border border-stone-200">
                              <input 
                                type="text"
                                value={cat.category}
                                onChange={e => {
                                  const newFaqs = [...supportContent.faqs];
                                  newFaqs[catIdx].category = e.target.value;
                                  setSupportContent({...supportContent, faqs: newFaqs});
                                }}
                                className="font-bold text-lg w-full mb-4 outline-none border-b border-stone-200 pb-2"
                                placeholder="Category Name"
                              />
                              <div className="space-y-4">
                                {cat.questions.map((q: any, qIdx: number) => (
                                  <div key={qIdx} className="space-y-2 pl-4 border-l-2 border-stone-100 relative group">
                                    <div className="flex gap-2">
                                      <input 
                                        type="text"
                                        value={q.q}
                                        onChange={e => {
                                          const newFaqs = [...supportContent.faqs];
                                          newFaqs[catIdx].questions[qIdx].q = e.target.value;
                                          setSupportContent({...supportContent, faqs: newFaqs});
                                        }}
                                        className="font-medium text-stone-900 w-full outline-none bg-stone-50 px-3 py-2 rounded-lg text-sm"
                                        placeholder="Question"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newFaqs = [...supportContent.faqs];
                                          newFaqs[catIdx].questions = newFaqs[catIdx].questions.filter((_: any, i: number) => i !== qIdx);
                                          setSupportContent({...supportContent, faqs: newFaqs});
                                        }}
                                        className="text-red-500 hover:text-red-700 p-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Question"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <textarea 
                                      value={q.a}
                                      onChange={e => {
                                        const newFaqs = [...supportContent.faqs];
                                        newFaqs[catIdx].questions[qIdx].a = e.target.value;
                                        setSupportContent({...supportContent, faqs: newFaqs});
                                      }}
                                      className="text-stone-600 w-full outline-none bg-stone-50 px-3 py-2 rounded-lg text-sm"
                                      placeholder="Answer"
                                      rows={2}
                                    />
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newFaqs = [...supportContent.faqs];
                                    newFaqs[catIdx].questions.push({ q: 'New Question', a: 'Answer...' });
                                    setSupportContent({...supportContent, faqs: newFaqs});
                                  }}
                                  className="text-xs text-stone-500 hover:text-stone-900 font-medium pl-4"
                                >
                                  + Add Question
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        )}
                      </div>

                      {/* Shipping & Returns Section */}
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div 
                          className="flex justify-between items-center mb-4 cursor-pointer"
                          onClick={() => setOpenSupportSection(openSupportSection === 'shipping' ? null : 'shipping')}
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-stone-900">Shipping & Returns Page</h3>
                            {openSupportSection === 'shipping' ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveSupportContent();
                            }}
                            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
                          >
                            Save Shipping
                          </button>
                        </div>
                        {openSupportSection === 'shipping' && (
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">Processing Time</label>
                            <textarea 
                              value={supportContent.shipping.processingTime}
                              onChange={e => setSupportContent({...supportContent, shipping: {...supportContent.shipping, processingTime: e.target.value}})}
                              className="w-full bg-white p-3 rounded-lg border border-stone-200 outline-none focus:border-stone-400 text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">Shipping Methods (One per line)</label>
                            <textarea 
                              value={supportContent.shipping.methods || ''}
                              onChange={e => setSupportContent({...supportContent, shipping: {...supportContent.shipping, methods: e.target.value}})}
                              className="w-full bg-white p-3 rounded-lg border border-stone-200 outline-none focus:border-stone-400 text-sm font-mono"
                              rows={3}
                              placeholder="Standard Ground: 3-5 business days&#10;Expedited: 2 business days"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">Our Quality Guarantee</label>
                            <textarea 
                              value={supportContent.shipping.guarantee}
                              onChange={e => setSupportContent({...supportContent, shipping: {...supportContent.shipping, guarantee: e.target.value}})}
                              className="w-full bg-white p-3 rounded-lg border border-stone-200 outline-none focus:border-stone-400 text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">Custom Orders Return Policy</label>
                            <textarea 
                              value={supportContent.shipping.customOrders}
                              onChange={e => setSupportContent({...supportContent, shipping: {...supportContent.shipping, customOrders: e.target.value}})}
                              className="w-full bg-white p-3 rounded-lg border border-stone-200 outline-none focus:border-stone-400 text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">Standard Items Return Policy</label>
                            <textarea 
                              value={supportContent.shipping.standardItems}
                              onChange={e => setSupportContent({...supportContent, shipping: {...supportContent.shipping, standardItems: e.target.value}})}
                              className="w-full bg-white p-3 rounded-lg border border-stone-200 outline-none focus:border-stone-400 text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                        )}
                      </div>

                      {/* Size Guide Section */}
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <div 
                          className="flex justify-between items-center mb-4 cursor-pointer"
                          onClick={() => setOpenSupportSection(openSupportSection === 'size' ? null : 'size')}
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-stone-900">Size Guide Table</h3>
                            {openSupportSection === 'size' ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveSupportContent();
                            }}
                            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
                          >
                            Save Size Guide
                          </button>
                        </div>
                        {openSupportSection === 'size' && (
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-3 gap-4 px-1">
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Art Size</div>
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mat Border</div>
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Frame Size</div>
                          </div>
                          {supportContent.sizeGuide?.map((row: any, rIdx: number) => (
                            <div key={rIdx} className="grid grid-cols-3 gap-4">
                              <input 
                                type="text"
                                value={row.art}
                                onChange={e => {
                                  const newSizeGuide = [...supportContent.sizeGuide];
                                  newSizeGuide[rIdx].art = e.target.value;
                                  setSupportContent({...supportContent, sizeGuide: newSizeGuide});
                                }}
                                className="w-full bg-white px-3 py-2 rounded-lg border border-stone-200 outline-none text-sm"
                                placeholder="Art Size"
                              />
                              <input 
                                type="text"
                                value={row.mat}
                                onChange={e => {
                                  const newSizeGuide = [...supportContent.sizeGuide];
                                  newSizeGuide[rIdx].mat = e.target.value;
                                  setSupportContent({...supportContent, sizeGuide: newSizeGuide});
                                }}
                                className="w-full bg-white px-3 py-2 rounded-lg border border-stone-200 outline-none text-sm"
                                placeholder="Mat Border"
                              />
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={row.frame}
                                  onChange={e => {
                                    const newSizeGuide = [...supportContent.sizeGuide];
                                    newSizeGuide[rIdx].frame = e.target.value;
                                    setSupportContent({...supportContent, sizeGuide: newSizeGuide});
                                  }}
                                  className="w-full bg-white px-3 py-2 rounded-lg border border-stone-200 outline-none text-sm"
                                  placeholder="Frame Size"
                                />
                                <button 
                                  onClick={() => {
                                    const newSizeGuide = supportContent.sizeGuide.filter((_: any, i: number) => i !== rIdx);
                                    setSupportContent({...supportContent, sizeGuide: newSizeGuide});
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold px-2"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newSizeGuide = [...(supportContent.sizeGuide || [])];
                              newSizeGuide.push({ art: '', mat: '', frame: '' });
                              setSupportContent({...supportContent, sizeGuide: newSizeGuide});
                            }}
                            className="text-sm font-medium text-stone-600 hover:text-stone-900"
                          >
                            + Add Row
                          </button>
                        </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* Legal Pages Tab */}
                {activeTab === 'navigation' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Navigation</h1>
                        <p className="text-stone-500 mt-1">Manage categories shown in the "More" mega dropdown.</p>
                      </div>
                      <button 
                        onClick={saveNavCategories}
                        className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Add Category</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            value={newNavCategory}
                            onChange={(e) => setNewNavCategory(e.target.value)}
                            placeholder="e.g. Abstract Art"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors"
                          />
                          <button 
                            onClick={() => {
                              if (newNavCategory.trim() && !navCategories.includes(newNavCategory.trim())) {
                                setNavCategories([...navCategories, newNavCategory.trim()]);
                                setNewNavCategory('');
                              }
                            }}
                            className="bg-stone-100 text-stone-900 px-6 py-2.5 rounded-xl font-medium hover:bg-stone-200 transition-colors whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Current Categories</label>
                        {navCategories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50">
                            <span className="font-medium text-stone-900">{cat}</span>
                            <button 
                              onClick={() => setNavCategories(navCategories.filter((_, i) => i !== idx))}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {navCategories.length === 0 && (
                          <p className="text-stone-500 text-sm">No categories added. The dropdown will be empty.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'legal' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium">Legal Pages</h2>
                    </div>

                    <div className="space-y-12">
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 relative">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">Privacy Policy</h3>
                            <p className="text-sm text-stone-500">Content for the /privacy-policy page. Supports line breaks.</p>
                            {legalSettings.privacyPolicyUpdatedAt && (
                              <p className="text-xs text-stone-400 mt-1">Last Updated: {new Date(legalSettings.privacyPolicyUpdatedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                          <button 
                            onClick={handleUpdatePrivacyPolicy}
                            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Save Privacy Policy
                          </button>
                        </div>
                        <textarea 
                          rows={15} 
                          value={legalSettings.privacyPolicy || ''} 
                          onChange={e => setLegalSettings({...legalSettings, privacyPolicy: e.target.value})} 
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-stone-900 font-mono text-sm" 
                        />
                      </div>

                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 relative">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">Terms of Service</h3>
                            <p className="text-sm text-stone-500">Content for the /terms page. Supports line breaks.</p>
                            {legalSettings.termsOfServiceUpdatedAt && (
                              <p className="text-xs text-stone-400 mt-1">Last Updated: {new Date(legalSettings.termsOfServiceUpdatedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                          <button 
                            onClick={handleUpdateTermsOfService}
                            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Save Terms of Service
                          </button>
                        </div>
                        <textarea 
                          rows={15} 
                          value={legalSettings.termsOfService || ''} 
                          onChange={e => setLegalSettings({...legalSettings, termsOfService: e.target.value})} 
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-stone-900 font-mono text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {viewingCustomItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col md:flex-row">
            {/* Left side: Visual Mockup */}
            <div className="md:w-1/2 p-8 bg-stone-50 border-r border-stone-100 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-full max-w-[400px] aspect-[4/5] bg-white shadow-sm overflow-hidden rounded-xl border border-stone-200 flex items-center justify-center">
                {(() => {
                  const productForMockup = products.find(p => p._id === viewingCustomItem.product);
                  const mockupImage = productForMockup?.mockupImage || viewingCustomItem.image;
                  
                  return (
                    <>
                      {mockupImage && (
                        <img 
                          src={mockupImage} 
                          alt="Mockup Overlay" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 drop-shadow-md"
                        />
                      )}
                      
                      {viewingCustomItem.userImage && (
                        <div 
                          className="absolute inset-0 z-10 pointer-events-none"
                          style={{
                            transform: `scale(${viewingCustomItem.customScaleX || 0.5}, ${viewingCustomItem.customScaleY || 0.5}) translate(${(viewingCustomItem.customX || 50) - 50}%, ${(viewingCustomItem.customY || 50) - 50}%)`,
                            transformOrigin: 'center'
                          }}
                        >
                          <img 
                            src={viewingCustomItem.userImage.split(',')[0]} 
                            alt="User custom upload" 
                            className="w-full h-full object-fill"
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <p className="mt-6 text-sm text-stone-500 font-medium">Customer&apos;s Mockup Preview</p>
            </div>
            
            {/* Right side: Details */}
            <div className="md:w-1/2 p-8 flex flex-col relative">
              <button 
                onClick={() => setViewingCustomItem(null)}
                className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Customization Details</h3>
              
              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Original Images ({viewingCustomItem.userImage.split(',').filter(Boolean).length})</h4>
                  {(() => {
                    const urls = (viewingCustomItem.userImage || '').split(',').filter(Boolean);
                    return urls.map((url: string, index: number) => (
                      <div key={index} className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100 mb-3 last:mb-0">
                        <img src={url} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-stone-200" alt={`Original ${index + 1}`} />
                        <a 
                          href={url} 
                          download={`custom_upload_${index + 1}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
                        >
                          Download Image {urls.length > 1 ? `#${index + 1}` : ''}
                        </a>
                      </div>
                    ));
                  })()}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Scale (X, Y)</h4>
                    <p className="font-mono text-sm font-medium text-stone-900">
                      {viewingCustomItem.customScaleX?.toFixed(2) || '1.00'}, {viewingCustomItem.customScaleY?.toFixed(2) || '1.00'}
                    </p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Position (X, Y)</h4>
                    <p className="font-mono text-sm font-medium text-stone-900">
                      {viewingCustomItem.customX?.toFixed(1) || '0.0'}px, {viewingCustomItem.customY?.toFixed(1) || '0.0'}px
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Customer Instructions</h4>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 min-h-[100px]">
                    <p className="text-sm text-stone-700 whitespace-pre-wrap">
                      {viewingCustomItem.instructions || <span className="text-stone-400 italic">No specific instructions provided.</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setShowAddTestimonial(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-stone-900 mb-6">Add New Testimonial</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const updatedTestimonials = [...testimonials, { ...newTestimonial, id: Date.now().toString() }];
              setTestimonials(updatedTestimonials);
              setShowAddTestimonial(false);
              handleUpdateTestimonials(updatedTestimonials);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Author Name</label>
                  <input required type="text" value={newTestimonial.authorName} onChange={e => setNewTestimonial({...newTestimonial, authorName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Initials</label>
                  <input required type="text" maxLength={2} value={newTestimonial.initials} onChange={e => setNewTestimonial({...newTestimonial, initials: e.target.value.toUpperCase()})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Review Text</label>
                <textarea required rows={3} value={newTestimonial.text} onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors resize-none" />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
                  <select value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})} className="px-4 py-2 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors bg-white">
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="new-verified" checked={newTestimonial.verified} onChange={e => setNewTestimonial({...newTestimonial, verified: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                  <label htmlFor="new-verified" className="text-sm font-medium text-stone-700 cursor-pointer">Verified Buyer</label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddTestimonial(false)} className="flex-1 px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-stone-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm">
                  Add Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Request Confirmation Modal */}
      {contactRequestToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Request?</h3>
            <p className="text-stone-500 mb-6">Are you sure you want to delete this contact request? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setContactRequestToDelete(null)} className="flex-1 px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                const newReqs = contactRequests.filter((_, i) => i !== contactRequestToDelete);
                setContactRequests(newReqs);
                localStorage.setItem('piks_contact_requests', JSON.stringify(newReqs));
                setContactRequestToDelete(null);
                toast.success('Request deleted');
              }} className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirmation Modals Layer */}
        {orderToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Order</h3>
              <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete order <span className="font-mono font-semibold text-stone-900">{orderToDelete}</span>? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center w-full">
                <button onClick={() => setOrderToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                <button onClick={() => confirmDeleteOrder(orderToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {productToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Product</h3>
              <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center w-full">
                <button onClick={() => setProductToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                <button onClick={() => confirmDeleteProduct(productToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {orderToReturn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Mark Order Returned</h3>
              <p className="text-stone-500 text-sm mb-6">Are you sure you want to mark order <span className="font-mono font-semibold text-stone-900">{orderToReturn}</span> as returned?</p>
              <div className="flex gap-3 justify-center w-full">
                <button onClick={() => setOrderToReturn(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                <button onClick={() => confirmReturnOrder(orderToReturn)} className="flex-1 bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-amber-700 transition-colors shadow-sm">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {sizeToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Size</h3>
              <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this size? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center w-full">
                <button onClick={() => setSizeToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                <button onClick={() => handleDeleteSize(sizeToDelete)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Rejection / Cancellation Reason Modal */}
        {rejectionModalOrder && (
          <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 my-auto text-left">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0 mb-4">
                <h3 className="text-lg font-bold text-stone-900">
                  {rejectionModalOrder.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectionModalOrder(null)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Please specify the reason why you are cancelling or not accepting this return / replacement request. This reason will be displayed on the customer's dashboard.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Reason for Not Accepting / Cancelling Request *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Attached photo proof does not indicate manufacturing defect, or return policy window of 7 days has expired."
                    value={adminRejectionReasonText}
                    onChange={(e) => setAdminRejectionReasonText(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm resize-none bg-stone-50/50"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setRejectionModalOrder(null)}
                    className="px-4 py-2 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminRejectionReasonText.trim()) {
                        toast.error('Please enter a reason before submitting.');
                        return;
                      }
                      handleUpdateOrderStatusValue(rejectionModalOrder.id, rejectionModalOrder.status, adminRejectionReasonText.trim());
                    }}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs"
                  >
                    Submit Cancellation Reason
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Accept Replacement Expected Date Modal */}
        {replacementModalOrder && (
          <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 my-auto text-left">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0 mb-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" /> Accept Replacement & Set Date
                </h3>
                <button
                  type="button"
                  onClick={() => setReplacementModalOrder(null)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Specify the expected delivery date for the replacement / exchange product. This date will be displayed to the customer on their order dashboard and tracking timeline.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Expected Replacement Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedReplacementDateInput}
                    onChange={(e) => setExpectedReplacementDateInput(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none text-sm bg-stone-50/50 font-medium"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setReplacementModalOrder(null)}
                    className="px-4 py-2 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!expectedReplacementDateInput) {
                        toast.error('Please select an expected delivery date.');
                        return;
                      }
                      handleUpdateOrderStatusValue(replacementModalOrder.id, replacementModalOrder.status, undefined, expectedReplacementDateInput);
                    }}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Replacement & Save Date
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  </>
    );
  }
