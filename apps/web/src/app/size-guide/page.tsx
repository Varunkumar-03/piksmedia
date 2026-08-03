'use client';

import Navbar from '../../components/Navbar';
import { ChevronLeft, Ruler, Maximize, Scan } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SizeGuidePage() {
  const [sizeGuide, setSizeGuide] = useState([
    { art: '5" x 7"', mat: '1.5"', frame: '8" x 10"' },
    { art: '8" x 10"', mat: '1.5"', frame: '11" x 14"' },
    { art: '11" x 14"', mat: '2"', frame: '16" x 20"' },
    { art: '16" x 20"', mat: '2"', frame: '20" x 24"' },
    { art: '18" x 24"', mat: '2.5"', frame: '24" x 30"' },
    { art: '24" x 36"', mat: '3"', frame: '30" x 42"' },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('piks_support_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.sizeGuide) {
        setSizeGuide(parsed.sizeGuide);
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-20">
      <Navbar className="w-full z-50 py-4 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-stone-200 sticky top-0" />

      <section className="relative pt-12 pb-12 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Size Guide
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Everything you need to know about measuring your art, choosing the right mat, and finding the perfect frame size.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-12 pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        
        {/* Anatomy of a Frame */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">The Anatomy of a Custom Frame</h2>
            <p className="text-stone-600 leading-relaxed">
              When we talk about frame dimensions, we are always referring to the <strong>inside dimension</strong> of the frame. This is the same size as the glass and the backing board.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Maximize className="w-4 h-4 text-stone-900" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Art Size</h4>
                  <p className="text-sm text-stone-600 mt-1">The exact dimensions of your physical artwork or photo.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Scan className="w-4 h-4 text-stone-900" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Mat Opening</h4>
                  <p className="text-sm text-stone-600 mt-1">The window cut in the mat. We automatically cut this 1/4" smaller than your art size so the art doesn't fall through.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Ruler className="w-4 h-4 text-stone-900" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Frame Size</h4>
                  <p className="text-sm text-stone-600 mt-1">The outer dimensions depend on the width of the wooden moulding you choose.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full relative aspect-square max-w-sm">
            <div className="absolute inset-0 bg-stone-900 rounded-xl shadow-lg border-[16px] border-[#8C7A6B] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-stone-100 m-8 shadow-inner border border-stone-200 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-stone-300 border-2 border-dashed border-stone-400 flex items-center justify-center">
                  <span className="font-bold text-stone-600">Art Size</span>
                </div>
                <div className="absolute top-2 left-0 w-full text-center text-xs font-bold text-stone-500 uppercase tracking-widest">Mat Border</div>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Sizes Table */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10 border-b border-stone-100">
            <h2 className="text-2xl font-bold text-stone-900">Standard Print & Frame Sizes</h2>
            <p className="text-stone-600 mt-2">A quick reference for the most common photography and art print dimensions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-8 py-4 font-bold text-stone-900 text-sm uppercase tracking-wider">Art Size</th>
                  <th className="px-8 py-4 font-bold text-stone-900 text-sm uppercase tracking-wider">Suggested Mat Border</th>
                  <th className="px-8 py-4 font-bold text-stone-900 text-sm uppercase tracking-wider">Resulting Frame Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sizeGuide.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-4 text-stone-900 font-medium">{row.art}</td>
                    <td className="px-8 py-4 text-stone-600">{row.mat}</td>
                    <td className="px-8 py-4 text-stone-900 font-bold">{row.frame}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
