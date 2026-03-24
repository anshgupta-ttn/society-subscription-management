"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const sections = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg> },
      { name: "Flats", href: "/admin/flats", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
      { name: "Plans", href: "/admin/plans", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    ],
  },
  {
    label: "RECORDS",
    items: [
      { name: "Monthly Records", href: "/admin/monthly", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg> },
      { name: "Payment Entry", href: "/admin/payments", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" strokeLinecap="round" /></svg> },
      { name: "Reports", href: "/admin/reports", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" /></svg> },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Notifications", href: "/admin/notifications", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M18 16.5v-5a6 6 0 10-12 0v5L4 18h16l-2-1.5z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 18a3 3 0 01-6 0" strokeLinecap="round" /></svg> },
      { name: "Profile", href: "/admin/profile", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /></svg> },
    ],
  },
];

export default function Sidebar({ onClose }) {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const userName = session?.user?.name || "Admin";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="w-64 min-h-screen flex flex-col border-r border-white/[0.04]"
      style={{ background: "linear-gradient(180deg, #0d0f18 0%, #0f1117 100%)" }}>

      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-4.5 h-4.5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">
              Society<span style={{ color: "#a78bfa" }}>Management</span>
            </span>
            <p className="text-[10px] text-slate-600 mt-0.5 tracking-wide">ADMIN PANEL</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />

      <nav className="flex-1 px-3 pb-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold text-slate-700 tracking-[0.15em] px-3 mb-2 uppercase">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = path === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => onClose?.()}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${active ? "text-white" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"}`}
                    style={active ? { background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)", boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)" } : {}}>
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />}
                    <span className={`transition-colors ${active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}>{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="px-3 py-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04] group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {userInitials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-600">Society Admin</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-slate-700 group-hover:text-red-400 transition-colors shrink-0">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
