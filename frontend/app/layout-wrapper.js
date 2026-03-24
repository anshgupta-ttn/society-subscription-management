'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ResidentSidebar from '@/app/components/ResidentSidebar';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isResident, setIsResident] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resident = localStorage.getItem('resident');

    const residentPages = ['/dashboard', '/subscriptions', '/pay-now', '/profile', '/notifications'];
    const isResidentPage = residentPages.some(page => pathname.startsWith(page));

    setIsResident(isResidentPage && !!resident);
    setLoading(false);
  }, [pathname]);

  if (loading) {
    return null;
  }

  if (isResident) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <div className="w-64 shrink-0">
          <ResidentSidebar />
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return children;
}
