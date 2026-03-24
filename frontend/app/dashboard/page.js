'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResidentLayout from '@/app/components/ResidentLayout';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function DashboardPage() {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (!stored) { router.push('/login'); return; }
    const r = JSON.parse(stored);
    setResident(r);
    fetchDashboard(r.id);
    const onFocus = () => fetchDashboard(r.id);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [router]);

  const fetchDashboard = async (flatId) => {
    try {
      const res = await fetch('http://localhost:5000/api/resident/dashboard', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ flatId }),
      });
      const data = await res.json();
      if (data.success) setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ResidentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#3b82f6", borderTopColor: "transparent" }} />
        </div>
      </ResidentLayout>
    );
  }

  const totalPaid = dashboard?.recentPayments?.reduce((s, p) => s + Number(p.amount_paid || 0), 0) || 0;

  return (
    <ResidentLayout>
      <div className="p-4 md:p-8 space-y-6 w-full animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hello, {resident?.owner_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Flat {resident?.flat_number} · Here's your overview</p>
          </div>
          <button
            onClick={() => fetchDashboard(resident?.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 text-xs rounded-lg font-medium transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Pending",
              value: dashboard?.pendingCount || 0,
              sub: "subscriptions",
              accent: "#f59e0b",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>,
            },
            {
              label: "Amount Due",
              value: `₹${dashboard?.totalDue || 0}`,
              sub: "total outstanding",
              accent: "#ef4444",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" /></svg>,
            },
            {
              label: "Paid",
              value: `₹${totalPaid}`,
              sub: "recent payments",
              accent: "#22c55e",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${s.accent}20 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
              />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.accent}18`, color: s.accent }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-[11px] text-slate-700 mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/subscriptions", label: "Subscriptions", accent: "#3b82f6", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { href: "/pay-now", label: "Pay Now", accent: "#22c55e", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg> },
            { href: "/profile", label: "My Profile", accent: "#8b5cf6", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /></svg> },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${a.accent}30`; e.currentTarget.style.boxShadow = `0 4px 20px ${a.accent}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all" style={{ background: `${a.accent}18`, color: a.accent }}>
                {a.icon}
              </div>
              <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{a.label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 ml-auto transition-colors">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="text-sm font-semibold text-white">Recent Payments</h2>
            <Link href="/subscriptions" className="text-[11px] text-slate-600 hover:text-blue-400 transition-colors">View all →</Link>
          </div>
          {dashboard?.recentPayments?.length > 0 ? (
            <div>
              {dashboard.recentPayments.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors"
                  style={{ borderBottom: i < dashboard.recentPayments.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">₹{p.amount_paid}</p>
                      <p className="text-[11px] text-slate-600 capitalize">{p.payment_mode || 'payment'}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">{new Date(p.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-slate-700 text-sm">No payments yet</div>
          )}
        </div>
      </div>
    </ResidentLayout>
  );
}
