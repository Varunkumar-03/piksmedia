'use client';
import { API_BASE_URL } from '../config';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, ArrowRight, Star, Hammer, Gem, Sparkles, ChevronLeft, ChevronRight, UploadCloud, Palette, SlidersHorizontal, Eye, Truck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ScrollMorphHero from '../components/ui/scroll-morph-hero';
import Navbar from '../components/Navbar';

const sanitizeImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const root = API_BASE_URL.replace('/api/v1', '');
    return `${root}${url}`;
  }
  return url;
};

export default function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.itemCount());
  const [mounted, setMounted] = useState(false);
  const [landingImages, setLandingImages] = useState({
    curation: [
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"
    ],
    bestSellers: [
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577083165275-c0f5f7eb75bb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop"
    ],
    community: [
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
    ]
  });

  const [testimonials, setTestimonials] = useState<any[]>([
    {
      id: '1',
      authorName: 'Sarah Jenkins',
      text: 'The quality of these frames is unmatched. They transformed my simple photos into gallery-worthy art pieces. Absolutely stunning craftsmanship.',
      rating: 5,
      verified: true,
      initials: 'SJ'
    }
  ]);

  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  
  // Coupons & Offers Home State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any>(null);

  const defaultLandingImages = {
    curation: [
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"
    ],
    bestSellers: [
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577083165275-c0f5f7eb75bb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop"
    ],
    community: [
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
    ]
  };

  useEffect(() => {
    setMounted(true);
    axios.get(`${API_BASE_URL}/settings/landing-page-images`)
      .then(res => {
        if (res.data?.data) {
          const merged = {
            curation: defaultLandingImages.curation.map((def, idx) => {
              const fetched = res.data.data.curation?.[idx];
              return (fetched && fetched.trim() !== "" && !fetched.includes('1520333789090-1afc82db536a')) ? sanitizeImageUrl(fetched) : def;
            }),
            bestSellers: defaultLandingImages.bestSellers.map((def, idx) => {
              const fetched = res.data.data.bestSellers?.[idx];
              return (fetched && fetched.trim() !== "" && !fetched.includes('1577083165275-c0f5f7eb75bb')) ? sanitizeImageUrl(fetched) : def;
            }),
            community: defaultLandingImages.community.map((def, idx) => {
              const fetched = res.data.data.community?.[idx];
              return (fetched && fetched.trim() !== "" && !fetched.includes('1497366216548-37526070297c')) ? sanitizeImageUrl(fetched) : def;
            })
          };
          setLandingImages(merged);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/settings/testimonials`)
      .then(res => {
        if (res.data.data) {
          setTestimonials(res.data.data);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/catalog/products`)
      .then(res => {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          setCatalogProducts(list);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/categories`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (data && Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/settings/coupons`)
      .then(res => {
        if (res.data?.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const activeCoupons = res.data.data.filter((c: any) => {
            if (!c.isActive) return false;
            if (c.expiryDate) {
              const exp = new Date(c.expiryDate);
              if (exp < today) return false;
            }
            return true;
          });
          setCoupons(activeCoupons);
        }
      })
      .catch(console.error);

    axios.get(`${API_BASE_URL}/settings/offers`)
      .then(res => {
        if (res.data?.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const activeOffers = res.data.data.filter((o: any) => {
            if (!o.isActive) return false;
            if (o.expiryDate) {
              const exp = new Date(o.expiryDate);
              if (exp < today) return false;
            }
            return true;
          });
          setOffers(activeOffers);
          if (activeOffers.length > 0) {
            setActiveOffer(activeOffers[0]);
            setShowOfferPopup(true);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-orange-200 selection:text-stone-900">
      
      {/* Navigation */}
      <Navbar className="fixed w-full z-50 top-0 py-3.5 px-4 md:px-8 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-stone-200/80 text-stone-900 transition-all" />

      {/* Coupons Scrolling Banner */}
      {coupons.length > 0 && (
        <div className="fixed w-full z-40 top-[70px] bg-gradient-to-r from-[#FDFBF7] via-[#f4ead2] to-[#FDFBF7] text-stone-850 py-2.5 overflow-hidden border-b border-[#ebdcc2] shadow-xs">
          <div className="flex w-max items-center gap-16 animate-marquee whitespace-nowrap text-[11px] font-bold uppercase tracking-widest">
            {Array(6).fill(coupons).flat().map((coupon, idx) => {
              const typeStr = coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`;
              const spendStr = coupon.minSpend && Number(coupon.minSpend) > 0 ? ` ON MIN SPEND OF ₹${coupon.minSpend}` : '';
              const expiryStr = coupon.expiryDate ? ` (VALID TILL ${new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()})` : '';
              return (
                <span key={idx} className="flex items-center gap-3">
                  <span className="bg-[#907341] text-[#FDFBF7] px-2 py-0.5 rounded text-[10px] font-mono font-extrabold shadow-xs">{coupon.code}</span>
                  <span>GET {typeStr} OFF WITH CODE {coupon.code}{spendStr}!{expiryStr}</span>
                  <span className="text-[#907341]/40">•</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <ScrollMorphHero />

      {/* Active Offers Section */}
      {offers.length > 0 && (
        <section className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-12 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-stone-300"></span>
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#907341] uppercase">Current Offers & Promotions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const typeStr = offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`;
              const catStr = !offer.category || offer.category === 'all' ? 'ALL PRODUCTS' : `${offer.category.toUpperCase()} PRODUCTS`;
              const subtitle = `FLAT ${typeStr} OFF ON ${catStr}`;
              return (
                <Link 
                  href={!offer.category || offer.category === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(offer.category)}`} 
                  key={offer._id}
                  className="bg-white border border-stone-200/80 rounded-2xl p-4 flex gap-4 hover:shadow-md hover:border-[#907341]/30 transition-all group cursor-pointer overflow-hidden relative"
                >
                  {offer.image && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-stone-100 bg-stone-50">
                      <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center min-w-0 flex-1 pr-6">
                    <span className="text-[9px] font-bold text-[#907341] tracking-wider uppercase mb-1">Promo Offer</span>
                    <h3 className="font-semibold text-stone-900 text-sm truncate">{offer.title}</h3>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5 uppercase tracking-wide truncate">{subtitle}</p>
                    {offer.expiryDate && (
                      <p className="text-[10px] text-stone-400 mt-2 font-mono">
                        Expires: {new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <div className="absolute right-4 bottom-4 text-stone-300 group-hover:text-[#907341] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Unique Shaped Category Auto-Scroll Strip */}
      <section className="relative z-20 py-8 sm:py-10 bg-[#FAF7F2] border-y border-stone-200/60 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 mb-6">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#907341] uppercase mb-1">Browse By Category</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1C1C1C]">Explore Collections</h3>
        </div>

        {/* Auto-Scrolling Infinite Marquee Container */}
        <div className="overflow-hidden relative w-full py-2">
          {/* Subtle edge fade overlays for smooth visual transition */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[#FAF7F2] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[#FAF7F2] to-transparent z-10 pointer-events-none"></div>

          <div className="flex items-center gap-4 sm:gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
            {(categoriesList.length > 0 ? [...categoriesList, ...categoriesList] : [
              { name: 'Frames', description: 'Handcrafted Wood', href: '/shop?category=Frames', image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600&auto=format&fit=crop', badge: 'Popular' },
              { name: 'Photo Prints', description: 'Archival Quality', href: '/shop?category=Photo%20Prints', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop', badge: 'Giclée' },
              { name: 'Canvas Art', description: 'Stretched Pine', href: '/shop?category=Canvas%20Art', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop', badge: 'Textured' },
              { name: 'Hand Arts', description: 'Custom Sketches', href: '/shop?category=Hand%20Arts', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Handmade' },
              { name: 'Paintings', description: 'Original Artworks', href: '/shop?category=Paintings', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Artisan' },
              { name: 'Funeral Frames', description: 'Memorial Tribute', href: '/shop?category=Funeral%20Frames', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', badge: 'Tribute' },
              { name: 'Custom Studio', description: 'Build Your Frame', href: '/custom', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop', badge: 'Custom' },
              { name: 'Frames', description: 'Handcrafted Wood', href: '/shop?category=Frames', image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600&auto=format&fit=crop', badge: 'Popular' },
              { name: 'Photo Prints', description: 'Archival Quality', href: '/shop?category=Photo%20Prints', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop', badge: 'Giclée' },
              { name: 'Canvas Art', description: 'Stretched Pine', href: '/shop?category=Canvas%20Art', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop', badge: 'Textured' },
              { name: 'Hand Arts', description: 'Custom Sketches', href: '/shop?category=Hand%20Arts', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Handmade' },
              { name: 'Paintings', description: 'Original Artworks', href: '/shop?category=Paintings', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Artisan' },
              { name: 'Funeral Frames', description: 'Memorial Tribute', href: '/shop?category=Funeral%20Frames', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', badge: 'Tribute' },
              { name: 'Custom Studio', description: 'Build Your Frame', href: '/custom', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop', badge: 'Custom' }
            ]).map((cat: any, idx: number) => {
              const catParam = cat.name || cat.slug || cat._id;
              const catHref = cat.href || `/shop?category=${encodeURIComponent(catParam)}`;
              const catImage = cat.image || 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600&auto=format&fit=crop';
              const catBadge = cat.badge || 'Popular';
              const catText = cat.description || cat.count || 'Collection';

              return (
                <Link 
                  key={idx} 
                  href={catHref}
                  className="group shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  {/* Image Card with exact leaf arch shape directly on section background */}
                  <div className="w-32 h-40 sm:w-36 sm:h-46 md:w-40 md:h-50 overflow-hidden relative rounded-tl-[38px] rounded-br-[38px] rounded-tr-xl rounded-bl-xl border border-white/80 bg-stone-200 shadow-md hover:shadow-xl transition-all duration-500">
                    <img 
                      src={catImage} 
                      alt={cat.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/20 to-transparent group-hover:from-stone-950/95 transition-colors duration-300"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-white text-[#907341] text-[8.5px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full shadow-xs">
                      {catBadge}
                    </div>

                    {/* Title & info inside card */}
                    <div className="absolute bottom-3 inset-x-2 text-center text-white">
                      <h4 className="font-serif text-xs sm:text-sm md:text-base font-medium tracking-wide drop-shadow-sm group-hover:text-amber-200 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-stone-200 font-sans tracking-wide mt-0.5 opacity-90 truncate">
                        {catText}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Curation Section */}
      <section className="relative z-10 block w-full py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto bg-[#FDFBF7] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#1C1C1C] mb-2 sm:mb-3">Curation</h2>
            <p className="text-[#6B6B6B] text-xs sm:text-[15px]">Explore our signature handcrafted collections.</p>
          </div>
          <Link href="/shop" className="text-[13px] font-bold text-[#1C1C1C] border-b-[1.5px] border-[#1C1C1C] pb-0.5 hover:text-stone-600 hover:border-stone-600 transition-colors mt-4 md:mt-0 tracking-wide">
            Explore All Collections
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Large Column */}
          <Link href="/shop/custom-frames" className="group relative col-span-1 lg:col-span-6 h-[220px] sm:h-[300px] lg:h-full block overflow-hidden bg-stone-100 rounded-xl">
            <img 
              src={mounted && landingImages.curation[0] ? landingImages.curation[0] : "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop"} 
              alt="Custom Photo Frames" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, margin: "-40px" }}
              className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center lg:!opacity-0 lg:group-hover:!opacity-100"
            >
              <motion.h3 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white text-2xl sm:text-4xl md:text-5xl font-serif tracking-wide text-center px-4 drop-shadow-md lg:transform lg:scale-95 lg:group-hover:scale-100 transition-transform duration-500"
              >
                Custom Photo Frames
              </motion.h3>
            </motion.div>
          </Link>

          {/* Right Column (Split Top/Bottom) */}
          <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 lg:gap-6 h-full">
            {/* Top Row */}
            <Link href="/shop/canvas-prints" className="group relative flex-1 block overflow-hidden bg-stone-100 h-[220px] sm:h-[300px] lg:h-auto rounded-xl">
              <img 
                src={mounted && landingImages.curation[1] ? landingImages.curation[1] : "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop"} 
                alt="Canvas Prints" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-40px" }}
                className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center lg:!opacity-0 lg:group-hover:!opacity-100"
              >
                <motion.h3 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-2xl sm:text-4xl font-serif tracking-wide text-center px-4 drop-shadow-md lg:transform lg:scale-95 lg:group-hover:scale-100 transition-transform duration-500"
                >
                  Canvas Prints
                </motion.h3>
              </motion.div>
            </Link>

            {/* Bottom Row (Split Left/Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <Link href="/shop/couple-gifts" className="group relative block overflow-hidden bg-stone-100 h-[180px] sm:h-[220px] lg:h-[240px] rounded-xl">
                <img 
                  src={mounted && landingImages.curation[2] ? landingImages.curation[2] : "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=800&auto=format&fit=crop"} 
                  alt="Couple Gifts" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, margin: "-40px" }}
                  className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center lg:!opacity-0 lg:group-hover:!opacity-100"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-white text-xl sm:text-2xl lg:text-3xl font-serif tracking-wide text-center px-2 drop-shadow-md lg:transform lg:scale-95 lg:group-hover:scale-100 transition-transform duration-500"
                  >
                    Couple Gifts
                  </motion.h3>
                </motion.div>
              </Link>
              
              <Link href="/shop/wedding" className="group relative block overflow-hidden bg-stone-100 h-[180px] sm:h-[220px] lg:h-[240px] rounded-xl">
                <img 
                  src={mounted && landingImages.curation[3] ? landingImages.curation[3] : "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"} 
                  alt="Wedding" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, margin: "-40px" }}
                  className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center lg:!opacity-0 lg:group-hover:!opacity-100"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-white text-xl sm:text-2xl lg:text-3xl font-serif tracking-wide text-center px-2 drop-shadow-md lg:transform lg:scale-95 lg:group-hover:scale-100 transition-transform duration-500"
                  >
                    Wedding
                  </motion.h3>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="relative z-10 block w-full py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-[#F9F8F6] overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 sm:mb-16 relative">
            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[50px] sm:text-[120px] md:text-[200px] font-serif text-stone-200/50 whitespace-nowrap pointer-events-none -z-10 select-none overflow-hidden max-w-full">
              Essentials
            </h2>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#907341] uppercase mb-2 sm:mb-4 relative z-10">The Essentials</p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#1C1C1C] relative z-10">Best Sellers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {(() => {
              const tagged = catalogProducts.filter((item: any) => {
                const t = String(item.tag || '').toUpperCase();
                return t === 'BEST SELLER' || t === 'LIMITED EDITION';
              });
              return tagged.length > 0 ? tagged : catalogProducts;
            })().slice(0, 4).map((item: any, idx: number) => {
              const imgSrc = (item.images && item.images.length > 0) ? item.images[0] : (item.image || (mounted && landingImages.bestSellers[idx] ? landingImages.bestSellers[idx] : defaultLandingImages.bestSellers[idx]) || '');
              const itemTitle = item.title;
              const itemPrice = item.price;
              const itemCollection = item.collection || (item.category?.name ? `${item.category.name} Collection` : 'Featured Collection');
              const itemTag = item.tag;

              return (
                <Link href={item._id ? `/shop/${item._id}` : '/shop'} key={item._id || idx} className="group cursor-pointer block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-200 mb-4 flex items-center justify-center group-hover:shadow-xl transition-all duration-500 rounded-xl">
                    {imgSrc ? (
                      <img src={imgSrc} alt={itemTitle} className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded text-indigo-400">
                        <svg className="w-8 h-8 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}

                    {itemTag && (
                      <div className="absolute top-4 right-4 bg-[#F2EFE9] text-[#907341] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 z-10 shadow-sm rounded-sm border border-[#e2ded5]">
                        {itemTag}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <span className="bg-white text-stone-900 text-[11px] font-bold uppercase tracking-[0.15em] py-3 px-6 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 rounded-sm">
                        Quick Preview
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mt-5">
                    <div>
                      <h3 className="font-medium text-[#1C1C1C] text-[15px] mb-1.5">{itemTitle}</h3>
                      <p className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">{itemCollection}</p>
                    </div>
                    <span className="font-bold text-[#1C1C1C] text-[14px]">₹{itemPrice?.toLocaleString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 bg-white text-center overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
        >
          
          {/* Feature 1 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="flex flex-col items-center group cursor-default"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-stone-900 group-hover:shadow-2xl group-hover:-translate-y-2">
              <Hammer className="w-6 h-6 sm:w-7 sm:h-7 text-[#1C1C1C] transition-colors duration-500 group-hover:text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#1C1C1C] mb-3 sm:mb-5 tracking-wide">Handcrafted</h3>
            <p className="text-[#6B6B6B] text-xs sm:text-[15px] leading-relaxed max-w-[320px]">
              Each piece is meticulously crafted by master artisans with decades of experience in fine woodworking and preservation.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="flex flex-col items-center group cursor-default"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-stone-900 group-hover:shadow-2xl group-hover:-translate-y-2">
              <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-[#1C1C1C] transition-colors duration-500 group-hover:text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#1C1C1C] mb-3 sm:mb-5 tracking-wide">Premium Materials</h3>
            <p className="text-[#6B6B6B] text-xs sm:text-[15px] leading-relaxed max-w-[320px]">
              We source only the finest sustainable woods, acid-free mounts, and museum-grade anti-reflective glass for ultimate clarity.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="flex flex-col items-center group cursor-default"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-stone-900 group-hover:shadow-2xl group-hover:-translate-y-2">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#1C1C1C] transition-colors duration-500 group-hover:text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#1C1C1C] mb-3 sm:mb-5 tracking-wide">Lifetime Memories</h3>
            <p className="text-[#6B6B6B] text-xs sm:text-[15px] leading-relaxed max-w-[320px]">
              Our framing techniques are designed to protect and preserve your most cherished moments for generations to come.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* Journey Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 bg-black text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-12 sm:mb-24">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif mb-4 sm:mb-6 tracking-wide text-white">The Journey of Your Story</h2>
            <p className="text-stone-300 text-sm sm:text-lg max-w-2xl leading-relaxed">
              A seamless, elevated experience from the first upload to the final delivery at your doorstep.
            </p>
          </div>

          {/* Steps */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-6"
          >
            {[
              { id: '1', icon: UploadCloud, title: 'UPLOAD', desc: 'High-res moments directly from your vault.' },
              { id: '2', icon: Palette, title: 'DESIGN', desc: 'Our curators optimize your image for the perfect fit.' },
              { id: '3', icon: SlidersHorizontal, title: 'CUSTOMIZE', desc: 'Select from our artisanal frame materials and mounts.' },
              { id: '4', icon: Eye, title: 'PREVIEW', desc: 'Visualize your masterpiece in 3D luxury space.' },
              { id: '5', icon: Truck, title: 'DELIVERED', desc: 'Hand-packed and white-glove shipped to your home.' }
            ].map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <motion.div 
                    custom={{ isLast: i === 4, index: i }}
                    variants={{
                      hidden: { 
                        backgroundColor: "rgba(255,255,255,0)", 
                        borderColor: "rgba(87,83,78,1)",
                        color: "rgba(255,255,255,1)",
                        boxShadow: "0px 0px 0px rgba(255,255,255,0)"
                      },
                      visible: (custom) => ({
                        backgroundColor: [
                          "rgba(255,255,255,0)", 
                          "rgba(255,255,255,1)", 
                          custom.isLast ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)"
                        ],
                        borderColor: [
                          "rgba(87,83,78,1)", 
                          "rgba(255,255,255,1)", 
                          custom.isLast ? "rgba(255,255,255,1)" : "rgba(87,83,78,1)"
                        ],
                        color: [
                          "rgba(255,255,255,1)", 
                          "rgba(0,0,0,1)", 
                          custom.isLast ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                        ],
                        boxShadow: [
                          "0px 0px 0px rgba(255,255,255,0)", 
                          "0px 0px 40px rgba(255,255,255,0.8)", 
                          "0px 0px 0px rgba(255,255,255,0)"
                        ],
                        transition: {
                          delay: custom.index * 0.4,
                          duration: 1.5,
                          times: [0, 0.4, 1],
                          ease: "easeInOut"
                        }
                      })
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-stone-600 flex items-center justify-center mb-6 sm:mb-8 ${i === 4 ? 'bg-white text-black border-white' : 'text-white'}`}
                  >
                    <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                  </motion.div>
                <motion.h4 
                  custom={{ index: i }}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: (custom) => ({ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: custom.index * 0.4 + 0.2, duration: 0.5 } 
                    })
                  }}
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 text-white"
                >
                  {step.title}
                </motion.h4>
                <motion.p 
                  custom={{ index: i }}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: (custom) => ({ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: custom.index * 0.4 + 0.4, duration: 0.5 } 
                    })
                  }}
                  className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-[200px]"
                >
                  {step.desc}
                </motion.p>
              </div>
            );
          })}
          </motion.div>
        </div>
      </section>

      {/* Community Collective Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 bg-white text-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#1C1C1C] mb-3 sm:mb-6 tracking-wide">Community Collective</h2>
            <p className="text-[#6B6B6B] text-xs sm:text-[15px]">
              Real homes, real memories, beautifully framed by PIKS MEDIA.
            </p>
          </div>

          {/* 'P' Shaped Grid Layout */}
          <div className="grid grid-cols-3 grid-rows-5 gap-3 sm:gap-4 md:gap-6 h-[500px] sm:h-[700px] md:h-[900px] max-w-3xl mx-auto px-2 sm:px-4">
            
            {/* Image 1: Spine Top (Row 1-3, Col 1) - Arch shape */}
            <div className="col-start-1 col-end-2 row-start-1 row-end-4 relative overflow-hidden bg-stone-100 group cursor-pointer shadow-sm rounded-t-full rounded-b-2xl">
              <img src={mounted && landingImages.community[0] ? landingImages.community[0] : "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop"} alt="Home interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Image 2: Spine Bottom (Row 4-5, Col 1) - Inverted Arch shape */}
            <div className="col-start-1 col-end-2 row-start-4 row-end-6 relative overflow-hidden bg-stone-100 group cursor-pointer shadow-sm rounded-b-full rounded-t-2xl">
              <img src={mounted && landingImages.community[1] ? landingImages.community[1] : "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop"} alt="Bedroom interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Image 3: Loop Top (Row 1, Col 2) - Pill shape */}
            <div className="col-start-2 col-end-3 row-start-1 row-end-2 relative overflow-hidden bg-stone-100 group cursor-pointer shadow-sm rounded-full">
              <img src={mounted && landingImages.community[2] ? landingImages.community[2] : "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"} alt="Event space" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Image 4: Loop Right (Row 1-3, Col 3) - Right Rounded shape */}
            <div className="col-start-3 col-end-4 row-start-1 row-end-4 relative overflow-hidden bg-stone-100 group cursor-pointer shadow-sm rounded-r-full rounded-l-2xl">
              <img src={mounted && landingImages.community[3] ? landingImages.community[3] : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"} alt="Living room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Image 5: Loop Bottom (Row 3, Col 2) - Pill shape */}
            <div className="col-start-2 col-end-3 row-start-3 row-end-4 relative overflow-hidden bg-stone-100 group cursor-pointer shadow-sm rounded-full">
              <img src={mounted && landingImages.community[4] ? landingImages.community[4] : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"} alt="Office space" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="px-2 sm:px-4 md:px-8 pb-12 sm:pb-20 overflow-hidden">
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-stone-900 text-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
          <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mb-8 sm:mb-12">Loved by <span className="font-serif italic text-stone-400">thousands</span></h2>
          
          <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee gap-4 sm:gap-6 py-2 sm:py-4 hover:[animation-play-state:paused]">
              {[...testimonials, ...testimonials, ...testimonials, ...testimonials].slice(0, Math.max(testimonials.length * 4, 10)).map((t, i) => (
                <div key={`${t.id}-${i}`} className="bg-stone-800/50 p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-stone-700/50 text-left backdrop-blur-sm w-[270px] sm:w-[380px] shrink-0 hover:bg-stone-800 transition-colors">
                  <div className="flex gap-1 mb-4 sm:mb-6 text-orange-200">
                    {[...Array(t.rating || 5)].map((_, starIdx) => (
                      <Star key={starIdx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-[15px] text-stone-300 font-light mb-6 sm:mb-8 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-700 flex items-center justify-center text-[10px] sm:text-xs font-bold text-stone-400">
                      {t.initials || t.authorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{t.authorName}</p>
                      {t.verified && <p className="text-stone-500 text-[9px] sm:text-[11px] uppercase tracking-wider mt-0.5">Verified Buyer</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Offers Popup Modal */}
      {showOfferPopup && activeOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-stone-950 rounded-3xl shadow-2xl w-full max-w-[380px] min-h-[480px] overflow-hidden border border-stone-850 flex flex-col relative transform scale-100 transition-transform">
            
            {/* Background Image */}
            {activeOffer.image ? (
              <>
                <img src={activeOffer.image} alt={activeOffer.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900"></div>
            )}

            {/* Close Button */}
            <button 
              onClick={() => setShowOfferPopup(false)} 
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs font-bold text-xs"
              title="Close Offer"
            >
              ✕
            </button>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 text-white">
              <div>
                <span className="bg-[#907341] text-[#FDFBF7] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-white/20">
                  Special Offer
                </span>
                <h3 className="text-2xl font-serif mt-3.5 font-semibold leading-tight drop-shadow-xs">{activeOffer.title}</h3>
                <p className="text-xs text-stone-300 mt-1 font-semibold tracking-wide drop-shadow-xs uppercase">
                  {(() => {
                    const typeStr = activeOffer.discountType === 'percentage' ? `${activeOffer.discountValue}%` : `₹${activeOffer.discountValue}`;
                    const catStr = !activeOffer.category || activeOffer.category === 'all' ? 'ALL PRODUCTS' : `${activeOffer.category.toUpperCase()} PRODUCTS`;
                    return `FLAT ${typeStr} OFF ON ${catStr}`;
                  })()}
                </p>
              </div>
              
              {activeOffer.expiryDate && (
                <p className="text-[10px] text-stone-300 font-medium tracking-wider uppercase mt-4 drop-shadow-xs">
                  Offer Valid Till {new Date(activeOffer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}

              <Link 
                href={!activeOffer.category || activeOffer.category === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(activeOffer.category)}`}
                onClick={() => setShowOfferPopup(false)} 
                className="mt-4 w-full bg-white hover:bg-stone-100 text-stone-950 py-3 rounded-xl text-xs font-bold transition-all shadow-md text-center block"
              >
                Claim Offer
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
