'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 pt-4 pb-1">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        title="Go back to previous page"
        aria-label="Go back to previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
}
