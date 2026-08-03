'use client';
import { API_BASE_URL } from '../../config';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Camera, Filter, X } from 'lucide-react';
import axios from 'axios';
import useCartStore from '../../store/useCartStore';
import Navbar from '../../components/Navbar';


import { useSearchParams } from 'next/navigation';

function ShopContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const itemCount = useCartStore((state) => state.itemCount());
  const [mounted, setMounted] = useState(false);

  const urlSearch = searchParams.get('search');

  useEffect(() => {
    setSelectedCategory(urlCategory || '');
    setSearchTerm(urlSearch || '');
  }, [urlCategory, urlSearch]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        const catArray = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setCategories(catArray);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy) params.sort = sortBy;

        const res = await axios.get(`${API_BASE_URL}/catalog/products`, { params });
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setProducts(list);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      {/* Navigation (simplified for shop page) */}
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <div className="container mx-auto px-6 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-6">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 md:mb-0">
            The <span className="italic text-stone-500 font-serif">Collection</span>
          </h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium border border-stone-200 px-4 py-2 rounded-full hover:bg-stone-50 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filter & Sort
          </button>
        </div>

        {/* Category Pill Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
              !selectedCategory 
                ? 'bg-stone-900 text-white shadow-md' 
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            All Products
          </button>
          {categories.map((cat: any) => {
            const cleanSelected = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanCatName = (cat.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanCatSlug = (cat.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const isSelected = cleanSelected === cleanCatName || 
                               cleanSelected === cleanCatSlug || 
                               selectedCategory === String(cat._id);
            return (
              <button
                key={cat._id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                  isSelected 
                    ? 'bg-stone-900 text-white shadow-md' 
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Filter Popup Modal Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            />

            {/* Modal Dialog */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 md:p-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <h3 className="text-xl font-serif text-stone-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-stone-700" /> Filter & Sort
                </h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                  title="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range Slider Field */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-stone-800">Price Range</label>
                    <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                      Up to ₹{maxPrice ? Number(maxPrice).toLocaleString('en-IN') : '10,000'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPrice || '10000'}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                  />
                  <div className="flex justify-between text-xs text-stone-400 mt-2 font-medium">
                    <span>₹0</span>
                    <span>₹5,000</span>
                    <span>₹10,000+</span>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-stone-900 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    setMaxPrice('');
                    setSortBy('newest');
                  }}
                  className="flex-1 py-3 text-xs font-semibold text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-full transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-[4/5] bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-200 w-3/4 rounded"></div>
                <div className="h-4 bg-stone-200 w-1/4 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif text-stone-800 mb-2">
              {selectedCategory ? `No products found in this category` : 'No products available'}
            </h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              {selectedCategory ? (
                <>
                  We currently don&apos;t have any items available in <span className="font-medium text-stone-700">&ldquo;{categories.find(c => String(c._id) === String(selectedCategory) || c.name === selectedCategory || c.slug === selectedCategory)?.name || selectedCategory}&rdquo;</span>. Check back soon or explore our full collection.
                </>
              ) : (
                'There are currently no items matching your criteria. Try adjusting your search or filters.'
              )}
            </p>
            <Link 
              href="/shop" 
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
              }} 
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/shop/${product._id}`} key={product._id} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 mb-4 relative flex items-center justify-center p-2">
                  <img 
                    src={(product.images && product.images.length > 0) ? product.images[0] : (product.image || 'https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Img')} 
                    alt={product.title} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.tag && (
                    <div className="absolute top-3 right-3 bg-[#F2EFE9] text-[#907341] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 z-10 shadow-sm rounded-sm border border-[#e2ded5]">
                      {product.tag}
                    </div>
                  )}
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-500"></div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-stone-800 text-lg">{product.title}</h3>
                    <p className="text-stone-500 text-sm">{product.category?.name || 'Premium Frame'}</p>
                  </div>
                  <span className="font-medium text-stone-900">₹{product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
