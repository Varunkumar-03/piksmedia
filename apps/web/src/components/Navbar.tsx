'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, LogOut, ChevronDown, ChevronLeft, Menu, X, Package, ShieldCheck, Home } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { useState, useEffect, Suspense } from 'react';

interface NavbarProps {
  className?: string;
  hideLinks?: boolean;
}

function NavbarContent({ className, hideLinks = false }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.itemCount());
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navCategories, setNavCategories] = useState<string[]>(['Hand Arts', 'Paintings', 'Funeral Frames']);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const getLinkClass = (path: string, cat?: string) => {
    let isActive = false;
    if (cat) {
      isActive = pathname === path && category === cat;
    } else {
      isActive = pathname === path && !category;
      if (path !== '/shop' && pathname === path) isActive = true;
    }
    return `transition-all pb-1 ${isActive ? 'text-stone-900 font-bold border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-900'}`;
  };

  useEffect(() => {
    setMounted(true);
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
    } else {
      localStorage.setItem('piks_nav_categories', JSON.stringify(['Hand Arts', 'Paintings', 'Funeral Frames']));
    }
  }, []);

  const baseClassName = className || "w-full py-4 px-4 md:px-8 flex items-center justify-between bg-white border-b border-stone-200 text-stone-900 relative";

  return (
    <>
      <nav className={baseClassName}>
        {/* Left Side: Logo */}
        <div className="flex items-center z-10">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/logo.png" alt="Piks Media Logo" className="h-9 md:h-10 w-auto object-contain" />
          </Link>
        </div>
        
        {/* Desktop Center Links */}
        {!hideLinks && (
          <div className="hidden md:flex gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2 items-center">
            <Link href="/shop" className={getLinkClass('/shop')}>All Products</Link>
            <Link href="/shop?category=Photo%20Prints" className={getLinkClass('/shop', 'Photo Prints')}>Photo Prints</Link>
            <Link href="/shop?category=Canvas%20Art" className={getLinkClass('/shop', 'Canvas Art')}>Canvas Art</Link>
            
            <div className="relative group flex items-center py-6 -my-6">
              <span className="cursor-pointer text-stone-500 hover:text-stone-900 transition-all flex items-center gap-1 pb-1">
                More <ChevronDown className="w-4 h-4" />
              </span>
              <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[240px] bg-white border border-stone-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4 flex flex-col space-y-1 rounded-b-xl">
                {navCategories.map((cat, idx) => (
                  <Link 
                    key={idx} 
                    href={`/shop?category=${encodeURIComponent(cat)}`} 
                    className="text-stone-600 hover:text-stone-900 hover:bg-stone-50 p-3 rounded-lg transition-colors font-medium"
                  >
                    {cat}
                  </Link>
                ))}
                {navCategories.length === 0 && (
                  <div className="w-full text-stone-500 text-center py-4">No categories added yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Side Icons + Hamburger Button */}
        <div className="flex gap-2 sm:gap-4 md:gap-5 text-sm font-medium items-center z-10">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="p-1.5 hover:opacity-70 transition-opacity text-stone-900 cursor-pointer" 
            title="Search Products"
            aria-label="Search Products"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <Link href={isAuthenticated ? (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} className="hidden sm:flex p-1.5 hover:opacity-70 transition-opacity text-stone-900" title="Account">
            <User className="w-5 h-5 stroke-[1.5]" />
          </Link>
          
          <Link href="/cart" className="relative p-1.5 hover:opacity-70 transition-opacity text-stone-900 flex items-center justify-center" title="Cart">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <button onClick={() => logout()} className="hidden md:block p-1.5 hover:opacity-70 transition-opacity text-stone-900" title="Log Out">
              <LogOut className="w-5 h-5 stroke-[1.5]" />
            </button>
          )}

          {/* Right-Side Hamburger Menu Button */}
          {!hideLinks && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-stone-900 ml-1"
              aria-label="Toggle Navigation Menu"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </nav>

      {/* Interactive Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-start pt-20 px-4">
          <div 
            onClick={() => setIsSearchOpen(false)} 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200" 
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-stone-500" /> Search Products
              </h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                autoFocus
                placeholder="Type to search (e.g. Oak Frame, Canvas, Fine Art...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 text-stone-900 text-sm transition-colors"
              />
              <button
                type="submit"
                className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Live Relevant Suggestions / Typing Recommendations */}
            <div className="mt-2 pt-2 border-t border-stone-100 max-h-[300px] overflow-y-auto space-y-1">
              {searchQuery.trim().length > 0 ? (
                (() => {
                  const suggestions = [
                    { title: 'Natural Oak Wood Frame', category: 'Frames', href: '/shop?search=Oak' },
                    { title: 'Matte Black Aluminum Frame', category: 'Frames', href: '/shop?search=Black' },
                    { title: 'Archival Fine Art Print', category: 'Photo Prints', href: '/shop?search=Art%20Print' },
                    { title: 'Gallery Wrapped Canvas', category: 'Canvas Art', href: '/shop?search=Canvas' },
                    { title: 'Hand Arts & Custom Sketches', category: 'Hand Arts', href: '/shop?category=hand-arts' },
                    { title: 'Original Art Paintings', category: 'Paintings', href: '/shop?category=paintings' },
                    { title: 'Memorial Tribute Frames', category: 'Funeral Frames', href: '/shop?category=funeral-frames' }
                  ].filter(item => 
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.category.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  return suggestions.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">Suggestions for &ldquo;{searchQuery}&rdquo;</p>
                      {suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            router.push(item.href);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors group"
                        >
                          <span className="text-sm font-medium text-stone-800 group-hover:text-stone-900">{item.title}</span>
                          <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/60">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-stone-400">
                      Press enter to search for &ldquo;<span className="text-stone-700 font-medium">{searchQuery}</span>&rdquo; in full catalog
                    </div>
                  );
                })()
              ) : (
                <div>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">Popular Searches</p>
                  <div className="flex flex-wrap gap-2 px-1">
                    {['Oak Frame', 'Photo Prints', 'Canvas Art', 'Hand Sketches', 'Memorial Frame'].map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          router.push(`/shop?search=${encodeURIComponent(term)}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-Out Drawer (Sliding in from LEFT SIDE) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-[95] animate-in fade-in duration-200"
          />

          {/* Left-Side Drawer Content */}
          <div className="relative z-[100] w-[85vw] max-w-[320px] h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Piks Logo" className="h-8 w-auto" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Categories</h4>
                <div className="space-y-1.5">
                  <Link
                    href="/shop"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm transition-colors"
                  >
                    <span>All Products</span>
                    <Package className="w-4 h-4 text-stone-400" />
                  </Link>
                  <Link
                    href="/shop?category=Photo%20Prints"
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <span>Photo Prints</span>
                  </Link>
                  <Link
                    href="/shop?category=Canvas%20Art"
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <span>Canvas Art</span>
                  </Link>
                  {navCategories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={`/shop?category=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                    >
                      <span>{cat}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Account & Orders</h4>
                <div className="space-y-1.5">
                  <Link
                    href={isAuthenticated ? (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <span>{isAuthenticated ? 'My Account Dashboard' : 'Sign In / Register'}</span>
                    <User className="w-4 h-4 text-stone-400" />
                  </Link>
                  <Link
                    href="/track-order"
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <span>Track Order Status</span>
                    <Package className="w-4 h-4 text-stone-400" />
                  </Link>
                  <Link
                    href="/story"
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <span>Why Piks Media?</span>
                    <ShieldCheck className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pathname !== '/' && (
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pt-3 pb-0">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            title="Go back to previous page"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}
    </>
  );
}

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={null}>
      <NavbarContent {...props} />
    </Suspense>
  );
}
