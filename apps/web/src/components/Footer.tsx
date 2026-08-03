'use client';
import { API_BASE_URL } from '../config';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(null);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/footer`);
        if (res.data.success && res.data.data) {
          setFooterData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching footer data', err);
      }
    };
    fetchFooter();
  }, []);

  if (!footerData) {
    return (
      <footer 
        className="pt-20 pb-8 text-stone-300 mt-auto relative bg-stone-900 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497250681560-ef03f56d9539?q=80&w=2000")' }}
      >
        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className="pt-20 pb-8 text-stone-300 mt-auto relative bg-stone-900 bg-cover bg-center"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497250681560-ef03f56d9539?q=80&w=2000")' }}
    >
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{footerData.brand?.name || 'Piks Media'}</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
              {footerData.brand?.description}
            </p>
            <div className="flex flex-col gap-2 text-sm text-stone-400">
              {footerData.brand?.email && (
                <a href={`mailto:${footerData.brand.email}`} className="hover:text-white transition">{footerData.brand.email}</a>
              )}
              {footerData.brand?.phone && <p>{footerData.brand.phone}</p>}
              {footerData.brand?.address && <p className="whitespace-pre-wrap">{footerData.brand.address}</p>}
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Shop</h3>
            <ul className="space-y-4 text-sm">
              {(footerData.shopLinks || []).map((link: any, idx: number) => (
                <li key={idx}><a href={link.url} className="hover:text-white transition">{link.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Support & Company</h3>
            <ul className="space-y-4 text-sm">
              {(() => {
                const links = [...(footerData.supportLinks || [])];
                if (!links.some((l: any) => l.url === '/story' || l.label?.toLowerCase().includes('why us') || l.label?.toLowerCase().includes('story'))) {
                  links.unshift({ label: 'Why Us?', url: '/story' });
                }
                return links.map((link: any, idx: number) => {
                  const label = link.label === 'Our Story' ? 'Why Us?' : link.label;
                  return (
                    <li key={idx}><a href={link.url} className="hover:text-white transition">{label}</a></li>
                  );
                });
              })()}
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">{footerData.newsletter?.title || 'Stay in the Loop'}</h3>
            <p className="text-stone-400 text-sm mb-4">{footerData.newsletter?.description || 'Subscribe for exclusive offers, inspiration, and 10% off your first order.'}</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-stone-800/50 border border-stone-700 text-white text-sm rounded-lg px-4 py-2 w-full focus:outline-none focus:border-stone-500 transition-colors"
              />
              <button type="button" className="bg-white text-stone-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-200 transition-colors">
                Join
              </button>
            </form>
            <div className="flex gap-4 mt-8">
              {footerData.socials?.twitter && (
                <a href={footerData.socials.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors text-stone-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
              )}
              {footerData.socials?.instagram && (
                <a href={footerData.socials.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-colors text-stone-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {footerData.brand?.name || 'Piks Media'}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="hover:text-stone-300 transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-stone-300 transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
