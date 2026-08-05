'use client';
import { API_BASE_URL } from '../../../config';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Camera, ChevronLeft, Minus, Plus, ShoppingBag, XCircle, MapPin, Truck, Check, Star, Upload, Play, MessageSquare, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import useCartStore from '../../../store/useCartStore';
import useMascotStore from '../../../store/useMascotStore';
import Navbar from '../../../components/Navbar';


export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8x10');
  const addItem = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.itemCount());

  const [mounted, setMounted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Delivery Pincode Checker States
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{ available: boolean; text: string } | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [showBlast, setShowBlast] = useState(false);
  const [deliveryLocations, setDeliveryLocations] = useState<any[]>([]);

  // Reviews & Related Products States
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 5.0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewerEmail, setNewReviewerEmail] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewMediaList, setReviewMediaList] = useState<Array<{ type: 'image' | 'video'; url: string }>>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [activeMediaModal, setActiveMediaModal] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings/delivery-locations`)
      .then(res => setDeliveryLocations(res.data.data || []))
      .catch(() => setDeliveryLocations([]));

    axios.get(`${API_BASE_URL}/categories`)
      .then(res => setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => setCategories([]));
  }, []);

  // Fetch Approved Reviews & Related Products
  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE_URL}/reviews/product/${id}`)
      .then(res => {
        if (res.data?.data) {
          setReviews(res.data.data.reviews || []);
          setReviewStats(res.data.data.stats || { totalReviews: 0, averageRating: 5.0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
        }
      })
      .catch(err => console.error('Failed to fetch reviews', err));

    axios.get(`${API_BASE_URL}/catalog/products`)
      .then(res => {
        if (res.data?.data) {
          const allProds = res.data.data;
          const filtered = allProds.filter((p: any) => String(p._id) !== String(id)).slice(0, 4);
          setRelatedProducts(filtered);
        }
      })
      .catch(err => console.error('Failed to fetch related products', err));
  }, [id]);

  const handleReviewMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReviewMediaList((prev) => [
            ...prev,
            {
              type: isVideo ? 'video' : 'image',
              url: ev.target?.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/reviews`, {
        productId: id,
        userName: newReviewerName,
        userEmail: newReviewerEmail,
        rating: newRating,
        comment: newReviewComment,
        media: reviewMediaList,
      });

      if (res.data.success) {
        setReviewSuccessMsg('Thank you! Your review has been submitted and is pending admin approval.');
        setNewReviewerName('');
        setNewReviewerEmail('');
        setNewReviewComment('');
        setReviewMediaList([]);
        setNewRating(5);
        setTimeout(() => {
          setShowWriteReview(false);
          setReviewSuccessMsg('');
        }, 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCheckPincode = () => {
    if (!pincodeQuery || pincodeQuery.trim().length < 5) {
      setPincodeStatus({ available: false, text: 'Please enter a valid 6-digit postal code.' });
      return;
    }
    setCheckingPincode(true);
    const queryPin = pincodeQuery.trim();
    setTimeout(() => {
      setCheckingPincode(false);

      // Determine base product shipping charge text
      const prodDelivery = Number(product?.deliveryCharges || 0);
      const prodThreshold = Number(product?.freeShippingThreshold || 0);
      const prodPrice = Number(product?.price || 0);
      const isProductFree = (prodThreshold > 0 && prodPrice >= prodThreshold);

      let chargeMessage = '';
      if (isProductFree) {
        chargeMessage = 'Free Delivery';
      } else if (prodDelivery > 0) {
        chargeMessage = `Delivery Charges: ₹${prodDelivery}`;
      } else {
        chargeMessage = 'Free Delivery';
      }

      if (deliveryLocations.length === 0) {
        if (isProductFree || prodDelivery === 0) {
          setShowBlast(true);
          setTimeout(() => setShowBlast(false), 2000);
        }
        setPincodeStatus({ available: true, text: `✓ Delivery available to postal code ${queryPin} (${chargeMessage} • Est. 3-5 days)` });
        return;
      }

      const matched = deliveryLocations.find((loc: any) => {
        const code = typeof loc === 'string' ? loc : (loc.pincode || loc.postalCode || loc.code);
        return code === queryPin;
      });

      if (matched) {
        let locChargeText = chargeMessage;
        let isSameDay = false;
        let isFree = false;
        if (typeof matched === 'object') {
          if (matched.type === 'free' || matched.deliveryType === 'free' || matched.isFree) {
            locChargeText = 'Free Delivery';
            isFree = true;
          } else if (matched.deliveryType === 'sameday') {
            isSameDay = true;
          } else if (matched.deliveryCharge && matched.deliveryCharge > 0) {
            locChargeText = `Delivery Charges: ₹${matched.deliveryCharge}`;
          }
        }

        if (isSameDay || isFree) {
          setShowBlast(true);
          setTimeout(() => setShowBlast(false), 2000);
        }

        setPincodeStatus({ 
          available: true, 
          text: isSameDay 
            ? `✓ Delivery available to postal code ${queryPin} (Same Day Delivery)` 
            : `✓ Delivery available to postal code ${queryPin} (${locChargeText} • Est. ${matched?.estimatedDays || '3-5'} days)` 
        });
      } else {
        setPincodeStatus({ available: false, text: `✕ Delivery is currently not available for postal code ${queryPin}.` });
      }
    }, 250);
  };

  // Customization States
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const userPhoto = userPhotos[activePhotoIndex] || null;
  const [scaleX, setScaleX] = useState(0.5);
  const [scaleY, setScaleY] = useState(0.5);
  const [photoPosX, setPhotoPosX] = useState(50);
  const [photoPosY, setPhotoPosY] = useState(50);
  const [isCustomized, setIsCustomized] = useState(false);
  const [instructions, setInstructions] = useState("");

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/catalog/products/${id}`);
        const prodData = res.data?.data || res.data;
        if (prodData && prodData._id) {
          setProduct(prodData);

          // Mascot reaction logic for product view & returning customer
          const visitedRaw = sessionStorage.getItem('visited_piks_products');
          const visitedSet = new Set(visitedRaw ? JSON.parse(visitedRaw) : []);
          
          if (visitedSet.has(id)) {
            useMascotStore.getState().triggerMood(
              5,
              `Back for another look? I knew you couldn't resist "${prodData.title}"! 😉`,
              7000,
              'product_returned'
            );
          } else {
            visitedSet.add(id);
            sessionStorage.setItem('visited_piks_products', JSON.stringify(Array.from(visitedSet)));
            useMascotStore.getState().triggerMood(
              4,
              `Ooh! Check out the museum quality finish on "${prodData.title}"! ✨`,
              6000,
              'product_view'
            );
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const availableSizes = (() => {
    if (!product) return ['8x10', '11x14', '16x20'];
    if (product.variants && product.variants.length > 0) {
      return Array.from(new Set(product.variants.map((v: any) => v.size)));
    }
    if (product.selectedSizes && product.selectedSizes.length > 0) {
      return product.selectedSizes;
    }
    return ['8x10', '11x14', '16x20'];
  })();

  useEffect(() => {
    // Stringify dependencies to avoid infinite loops if the array reference changes
    const sizes = JSON.stringify(availableSizes);
    if (product && availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] as string);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, JSON.stringify(availableSizes), selectedSize]);

  if (loading) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Product not found</div>;
  }

  const selectedVariant = product.variants?.find((v: any) => v.size === selectedSize);
  const displayPrice = selectedVariant?.price || product.price;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-32">
      {/* Navigation */}
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <div className="container mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Image Gallery */}
          {(() => {
            const allImages: string[] = [];
            if (product.image) allImages.push(product.image);
            if (Array.isArray(product.images)) {
              product.images.forEach((img: string) => {
                if (img && img !== product.image && !allImages.includes(img)) allImages.push(img);
              });
            }
            if (Array.isArray(product.gallery)) {
              product.gallery.forEach((img: string) => {
                if (img && !allImages.includes(img)) allImages.push(img);
              });
            }
            const activeSrc = (allImages.length > activeImageIndex) ? allImages[activeImageIndex] : (allImages[0] || 'https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Img');

            return (
              <div className="relative w-full rounded-3xl overflow-hidden bg-stone-100/90 border border-stone-200/80 shadow-lg max-h-[480px] sm:max-h-[520px] aspect-[4/3] flex items-center justify-center p-4 group">
                <img 
                  src={activeSrc} 
                  alt={product.title} 
                  className="w-full h-full object-contain max-h-[460px] sm:max-h-[500px] transition-all duration-300 drop-shadow-sm"
                />

                {/* Overlay Floating Gallery Thumbnails */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/60 shadow-xl max-w-[92%] overflow-x-auto no-scrollbar">
                    {allImages.map((img: string, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImageIndex(idx)}
                        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx 
                            ? 'border-stone-900 ring-2 ring-white/80 scale-105 shadow-md opacity-100' 
                            : 'border-white/60 opacity-60 hover:opacity-100'
                        }`}
                        title={`View image ${idx + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Product Info */}
          <div className="flex flex-col pt-0 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 text-xs tracking-widest uppercase font-semibold">
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
                      return matchedCat ? matchedCat.name : (catVal || 'Regular');
                    })()}
                  </span>
                  {product.tag && (
                    <span className="bg-[#F2EFE9] text-[#907341] text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm border border-[#e2ded5]">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Top Star Rating Badge */}
                {reviewStats.totalReviews > 0 ? (
                  <a href="#reviews" className="flex items-center gap-1.5 bg-amber-50/80 hover:bg-amber-100/80 text-stone-900 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs group">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= Math.round(reviewStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-stone-900 font-bold ml-0.5">{reviewStats.averageRating}</span>
                    <span className="text-stone-500 text-[11px] font-medium group-hover:underline">
                      ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </a>
                ) : (
                  <a href="#reviews" className="flex items-center gap-1 text-stone-300 hover:text-amber-400 transition-colors p-0.5" title="No reviews yet - Click to review">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-stone-300 stroke-[1.5] hover:fill-amber-400 hover:text-amber-400 transition-colors" />
                    ))}
                  </a>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1">{product.title}</h1>
              <p className="text-2xl font-bold text-stone-900 mt-1">₹{displayPrice}</p>
            </div>

            {product.description && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}

            <hr className="border-stone-100 my-2" />

            {/* Select Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Select Size</h3>
                <span onClick={() => setShowSizeGuide(true)} className="text-xs text-stone-500 underline cursor-pointer hover:text-stone-900 transition-colors">Size Guide</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((size: any) => (
                  <button 
                    key={size as string}
                    onClick={() => setSelectedSize(size as string)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedSize === size 
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs' 
                      : 'border-stone-200 text-stone-600 hover:border-stone-400 bg-white'
                    }`}
                  >
                    {size as string}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowCustomizeModal(true)}
              className="w-full bg-amber-50 text-amber-900 border border-amber-200/80 h-11 rounded-xl flex items-center justify-center text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              {isCustomized ? '✓ Edit Photo Customization' : 'Customize with your photo'}
            </button>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden h-11 bg-white shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full flex items-center justify-center hover:bg-stone-50 text-stone-500 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center font-bold text-xs">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 h-full flex items-center justify-center hover:bg-stone-50 text-stone-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button 
                onClick={() => {
                  addItem({
                    id: `${product._id}-${selectedSize}${isCustomized ? '-custom' : ''}`,
                    productId: product._id,
                    title: product.title,
                    price: displayPrice,
                    image: product.images ? product.images[0] : product.image,
                    size: selectedSize,
                    quantity: quantity,
                    deliveryCharges: product.deliveryCharges || 0,
                    freeShippingThreshold: product.freeShippingThreshold || 0,
                    ...(isCustomized && userPhotos.length > 0 ? {
                      userImage: userPhotos.join(','),
                      customScaleX: scaleX,
                      customScaleY: scaleY,
                      customX: photoPosX,
                      customY: photoPosY,
                      instructions: instructions
                    } : {})
                  });
                  window.location.href = '/cart';
                }}
                className="flex-1 bg-stone-900 text-white h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            <div className="pt-2 text-xs text-stone-500 space-y-1.5">
              {Number(product.freeShippingThreshold || 0) > 0 && (
                <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-stone-700" /> Free shipping on orders over ₹{Number(product.freeShippingThreshold).toLocaleString('en-IN')}</p>
              )}
              {product.returnDays && (
                <p className="flex items-center gap-1.5 text-stone-700 font-medium">✓ 7-day return policy</p>
              )}
              {product.replacementDays && (
                <p className="flex items-center gap-1.5 text-stone-700 font-medium">✓ 7-day replacement policy</p>
              )}
            </div>

            {/* Delivery Pincode Checker */}
            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 mt-2 relative">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes particle-burst {
                  0% {
                    transform: translate(-50%, -50%) rotate(0deg) scale(0);
                    opacity: 0;
                  }
                  15% {
                    transform: translate(-50%, -50%) rotate(90deg) scale(1.3);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(360deg) scale(0.3);
                    opacity: 0;
                  }
                }
                .animate-particle-burst {
                  animation: particle-burst 0.75s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }
              ` }} />

              {showBlast && (
                <div className="fixed inset-0 pointer-events-none z-[100]">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i * 360) / 60 + (Math.random() * 8 - 4);
                    const velocity = 150 + Math.random() * 300;
                    const rad = (angle * Math.PI) / 180;
                    const tx = Math.cos(rad) * velocity;
                    const ty = Math.sin(rad) * velocity;
                    const colors = ['#907341', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const isCircle = Math.random() > 0.5;
                    const size = 8 + Math.floor(Math.random() * 10);
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-[45%] animate-particle-burst"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          backgroundColor: randomColor,
                          borderRadius: isCircle ? '50%' : '3px',
                          '--tx': `${tx}px`,
                          '--ty': `${ty}px`,
                        } as React.CSSProperties}
                      />
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-stone-700 shrink-0" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Check Delivery Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincodeQuery}
                  onChange={(e) => setPincodeQuery(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckPincode()}
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-stone-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleCheckPincode}
                  disabled={checkingPincode}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs shrink-0"
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </div>
              {pincodeStatus && (
                <div className={`mt-2 text-xs font-semibold px-1 flex items-center gap-1.5 ${pincodeStatus.available ? 'text-emerald-700' : 'text-red-600'}`}>
                  <span>{pincodeStatus.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div id="reviews" className="mt-20 border-t border-stone-200 pt-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Customer Reviews & Ratings</h2>
              <p className="text-sm text-stone-500 mt-1">Real feedback & photo reviews shared by verified customers</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWriteReview(!showWriteReview)}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Write a Review
            </button>
          </div>

          {/* Write Review Form */}
          {showWriteReview && (
            <div className="bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200 mb-12 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Write Your Product Review</h3>
              {reviewSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {reviewSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Overall Rating *</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-7 h-7 ${star <= newRating ? 'fill-amber-400' : 'text-stone-300'}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-stone-700">{newRating} of 5 Stars</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Your Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Ananya Roy"
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. ananya@example.com"
                        value={newReviewerEmail}
                        onChange={(e) => setNewReviewerEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Your Review *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What did you love about this frame quality, finish, or packaging?"
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-stone-900 transition-colors resize-none"
                    />
                  </div>

                  {/* Upload Photos & Videos */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Upload Photos & Videos (Optional)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer flex items-center gap-2 transition-colors shadow-xs">
                        <Upload className="w-4 h-4 text-stone-500" /> Add Photos / Videos
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleReviewMediaUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-stone-400">Attach unboxing photos or MP4 video reviews</span>
                    </div>

                    {/* Media previews */}
                    {reviewMediaList.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {reviewMediaList.map((item, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group bg-black">
                            {item.type === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover opacity-80" />
                            ) : (
                              <img src={item.url} alt="Review attachment" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => setReviewMediaList(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-stone-900/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {item.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWriteReview(false)}
                      className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Rating Breakdown & Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200 mb-12">
            <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 pb-6 md:pb-0 md:pr-6 text-center">
              <span className="text-5xl font-black text-stone-900 tracking-tight">{reviewStats.totalReviews > 0 ? reviewStats.averageRating : '0.0'}</span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${reviewStats.totalReviews > 0 && s <= Math.round(reviewStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Based on {reviewStats.totalReviews} verified {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.distribution[stars as 1|2|3|4|5] || 0;
                const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-medium text-stone-600">
                    <span className="w-12 flex items-center gap-1 shrink-0 font-bold">{stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-semibold text-stone-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approved Reviews List */}
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                    ))}
                  </div>
                </div>

                {rev.title && <h4 className="font-bold text-stone-900 text-sm mb-1">{rev.title}</h4>}
                <p className="text-stone-700 text-sm leading-relaxed">{rev.comment}</p>

                {/* Media Attachments Gallery */}
                {rev.media && rev.media.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {rev.media.map((med: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setActiveMediaModal(med)}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 cursor-pointer hover:opacity-90 transition-opacity group"
                      >
                        {med.type === 'video' ? (
                          <video src={med.url} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <img src={med.url} alt="Customer review photo" className="w-full h-full object-cover" />
                        )}
                        {med.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-md">
                              <Play className="w-4 h-4 ml-0.5 fill-stone-900" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="font-bold text-stone-700">No reviews yet</h4>
                <p className="text-xs text-stone-400 mt-1">Be the first to share your thoughts and photo/video reviews!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-stone-200 pt-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-900">You Might Also Like</h2>
                <p className="text-sm text-stone-500 mt-1">Explore matching frames and popular collections</p>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-stone-900 hover:underline flex items-center gap-1">
                View All Products →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <Link
                  key={relProd._id}
                  href={`/shop/${relProd._id}`}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-stone-400 transition-all flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={relProd.images && relProd.images.length > 0 ? relProd.images[0] : (relProd.image || 'https://placehold.co/400x400')}
                      alt={relProd.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relProd.tag && (
                      <span className="absolute top-3 left-3 bg-[#907341] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {relProd.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-[#907341] transition-colors">{relProd.title}</h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">{relProd.description || 'Premium Handcrafted Frame'}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100">
                      <span className="font-bold text-stone-900 text-base">₹{relProd.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Media Preview Lightbox Modal */}
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative max-w-3xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2">
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              {activeMediaModal.type === 'video' ? (
                <video src={activeMediaModal.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl" />
              ) : (
                <img src={activeMediaModal.url} alt="Review full preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-stone-50 flex items-center justify-center min-h-[300px]">
              {(() => {
                const catObj = (typeof product.category === 'object' && product.category)
                  ? product.category
                  : categories.find(c => String(c._id) === String(product.category) || c.name.toLowerCase() === String(product.category).toLowerCase());
                
                let chartSrc = product.sizeChart || catObj?.sizeChart || catObj?.image || '';
                if (chartSrc === '(Size chart uploaded)' || typeof chartSrc !== 'string' || (!chartSrc.startsWith('http') && !chartSrc.startsWith('data:image'))) {
                  chartSrc = catObj?.sizeChart || catObj?.image || '';
                }
                if (chartSrc === '(Size chart uploaded)' || typeof chartSrc !== 'string' || (!chartSrc.startsWith('http') && !chartSrc.startsWith('data:image'))) {
                  chartSrc = '';
                }

                if (chartSrc) {
                  return <img src={chartSrc} alt="Size Chart" className="max-w-full h-auto rounded shadow-sm max-h-[70vh] object-contain" />;
                }
                return <p className="text-stone-500 font-medium">No size chart available for this product.</p>;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
            
            {/* Left Side: Preview */}
            <div className="w-full md:w-1/2 bg-stone-100 relative overflow-hidden flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 p-4">
              <div 
                className="relative w-full max-w-[400px] aspect-[4/5] bg-white shadow-sm overflow-hidden rounded-xl border border-stone-200"
                onMouseDown={() => setIsSelected(false)}
                onMouseMove={(e) => {
                  if (isDragging) {
                    const dx = e.clientX - dragStart.x;
                    const dy = e.clientY - dragStart.y;
                    setPhotoPosX(prev => prev + dx * 0.2);
                    setPhotoPosY(prev => prev + dy * 0.2);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  } else if (resizeDir) {
                    const dx = e.clientX - dragStart.x;
                    const dy = e.clientY - dragStart.y;
                    
                    if (resizeDir.includes('e')) setScaleX(prev => Math.max(0.1, prev + dx * 0.01));
                    if (resizeDir.includes('w')) setScaleX(prev => Math.max(0.1, prev - dx * 0.01));
                    if (resizeDir.includes('s')) setScaleY(prev => Math.max(0.1, prev + dy * 0.01));
                    if (resizeDir.includes('n')) setScaleY(prev => Math.max(0.1, prev - dy * 0.01));
                    
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseUp={() => { setIsDragging(false); setResizeDir(null); }}
                onMouseLeave={() => { setIsDragging(false); setResizeDir(null); }}
                onWheel={(e) => {
                  if (!userPhoto) return;
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -0.05 : 0.05;
                  setScaleX(prev => Math.max(0.1, Math.min(prev + delta, 4)));
                  setScaleY(prev => Math.max(0.1, Math.min(prev + delta, 4)));
                }}
              >
                {userPhoto && (
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      transform: `scale(${scaleX}, ${scaleY}) translate(${(photoPosX - 50)}%, ${(photoPosY - 50)}%)`,
                      transformOrigin: 'center'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsSelected(true);
                      setIsDragging(true);
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }}
                  >
                    {/* The Image */}
                    <img 
                      src={userPhoto} 
                      alt="User photo" 
                      className="w-full h-full object-fill pointer-events-none" 
                    />

                    {/* Transform Bounding Box */}
                    {isSelected && (
                      <div 
                        className="absolute inset-0 border-2 border-blue-500 cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsSelected(true);
                          setIsDragging(true);
                          setDragStart({ x: e.clientX, y: e.clientY });
                        }}
                      >
                        {/* Corner Handles */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('nw'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('ne'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('sw'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 translate-y-1/2 cursor-nwse-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('se'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                              
                        {/* Middle Handles */}
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('n'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('s'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute top-1/2 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('w'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                        <div className="absolute top-1/2 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize" 
                             onMouseDown={(e) => { e.stopPropagation(); setResizeDir('e'); setDragStart({ x: e.clientX, y: e.clientY }); }} />
                      </div>
                    )}
                  </div>
                )}
                {product.mockupImage && product.mockupImage !== '(Mockup uploaded)' && (
                  <img 
                    src={product.mockupImage} 
                    alt="Mockup Overlay" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-md"
                  />
                )}
                {!userPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-400 p-8 text-center border-2 border-dashed border-stone-200 m-4 rounded-xl z-0 pointer-events-none">
                    Upload a photo from the right panel to see it here
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Controls */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-stone-900">Customize Frame</h3>
                <button onClick={() => setShowCustomizeModal(false)} className="text-stone-400 hover:text-stone-900 transition-colors p-2 -mr-2">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-8">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-3">Upload High-Res Photos (Multiple allowed)</label>
                  <div className="w-full p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors flex flex-col items-center justify-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const filesArray = Array.from(e.target.files);
                          const promises = filesArray.map(file => {
                            return new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                resolve(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            });
                          });

                          Promise.all(promises).then((newPhotos) => {
                            setUserPhotos(prev => {
                              const updated = [...prev, ...newPhotos];
                              setActivePhotoIndex(updated.length - 1);
                              return updated;
                            });
                            // Reset controls on new upload
                            setScaleX(0.5);
                            setScaleY(0.5);
                            setPhotoPosX(50);
                            setPhotoPosY(50);
                            setIsSelected(true);
                          });
                        }
                      }} 
                      className="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer w-full max-w-[280px]" 
                    />
                  </div>
                </div>

                {/* Uploaded Photos Gallery */}
                {userPhotos.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Uploaded Photos ({userPhotos.length})</label>
                    <div className="grid grid-cols-4 gap-2">
                      {userPhotos.map((photo, idx) => (
                        <div 
                          key={idx} 
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer group ${idx === activePhotoIndex ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-stone-200 hover:border-stone-300'}`}
                          onClick={() => {
                            setActivePhotoIndex(idx);
                            setIsSelected(true);
                          }}
                        >
                          <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserPhotos(prev => {
                                const filtered = prev.filter((_, i) => i !== idx);
                                if (activePhotoIndex >= filtered.length) {
                                  setActivePhotoIndex(Math.max(0, filtered.length - 1));
                                }
                                return filtered;
                              });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                            title="Delete photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-stone-500 italic">Click a thumbnail to position/adjust that photo inside the frame.</p>
                  </div>
                )}

                {/* Instructions */}
                {userPhoto && (
                  <div className="space-y-4 bg-stone-50 p-6 rounded-xl border border-stone-100 animate-in fade-in slide-in-from-bottom-2">
                    <label className="block text-sm font-semibold text-stone-700">Instructions (Optional)</label>
                    <textarea 
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Enter any specific instructions for the design team..."
                      className="w-full rounded-lg border border-stone-200 bg-white p-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 h-24 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <div className="mt-8 pt-6 border-t border-stone-100 flex gap-4">
                <button onClick={() => setShowCustomizeModal(false)} className="flex-1 py-3.5 font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsCustomized(true);
                    setShowCustomizeModal(false);
                  }} 
                  disabled={!userPhoto}
                  className="flex-[2] bg-stone-900 text-white py-3.5 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Confirm Customization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
