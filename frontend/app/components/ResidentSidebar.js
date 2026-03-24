'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResidentNotificationBell from '@/app/components/ResidentNotificationBell';

const menu = [
  { name: 'Dashboard', href: '/dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg> },
  { name: 'Subscriptions', href: '/subscriptions', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { name: 'Pay Now', href: '/pay-now', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg> },
  { name: 'Notifications', href: '/notifications', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M18 16.5v-5a6 6 0 10-12 0v5L4 18h16l-2-1.5z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 18a3 3 0 01-6 0" strokeLinecap="round" /></svg> },
  { name: 'My Profile', href: '/profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /></svg> },
];

export default function ResidentSidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [resident, setResident] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (stored) setResident(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('resident');
    localStorage.removeItem('resident_token');
    document.cookie = 'resident_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="w-64 min-h-screen flex flex-col border-r border-white/[0.04]"
      style={{ background: "linear-gradient(180deg, #0d0f18 0%, #0f1117 100%)" }}>

      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-4 h-4">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-none">
              Society<span style={{ color: "#60a5fa" }}>Management</span>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 tracking-wide">RESIDENT PORTAL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ResidentNotificationBell />
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />

      {resident && (
        <div className="mx-3 mb-3 px-3 py-3 rounded-xl border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
              {resident.owner_name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{resident.owner_name}</p>
              <p className="text-[11px] text-slate-500">Flat {resident.flat_number}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-1 space-y-0.5">
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${active ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}`}
              style={active ? { background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.1) 100%)", boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.2)" } : {}}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />}
              <span className={`transition-colors ${active ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mt-2" />

      <div className="px-3 py-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px] transition-colors">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
