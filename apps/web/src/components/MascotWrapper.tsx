'use client';

import { usePathname } from 'next/navigation';
import MascotCompanion from './MascotCompanion';

export default function MascotWrapper() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <MascotCompanion />;
}
