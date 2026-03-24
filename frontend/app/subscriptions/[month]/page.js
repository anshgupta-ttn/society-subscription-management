'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ResidentLayout from '@/app/components/ResidentLayout';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function MonthlyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (!stored) { router.push('/login'); return; }
    const resident = JSON.parse(stored);

    const monthNum = parseInt(params.month, 10);
    const now = new Date();

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setErrorMsg('Invalid month.');
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (monthNum > now.getMonth() + 1) {
      setErrorMsg(`No records yet for month ${monthNum} — it's still in the future.`);
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchSubscription(resident.id, monthNum);
  }, [params]);

  const fetchSubscription = async (flatId, monthNum) => {
    try {
      const res = await fetch(`http://localhost:5000/api/resident/subscriptions/${monthNum}`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ flatId }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        setErrorMsg(data.message || 'Subscription not found.');
        setNotFound(true);
      }
    } catch {
      setErrorMsg('Failed to load subscription.');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const isPaid = subscription?.status === 'paid';

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

  const fmtTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '';

  return (
    <ResidentLayout>
      <div className="p-4 md:p-8 w-full max-w-2xl mx-auto space-y-6 animate-fade-up">

        <Link href="/subscriptions" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Subscriptions
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#3b82f6", borderTopColor: "transparent" }} />
          </div>
        ) : notFound || !subscription ? (
          <div className="rounded-2xl p-12 text-center space-y-2"
            style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="text-red-400 font-semibold text-sm">Not Found</p>
            <p className="text-slate-500 text-sm">{errorMsg || 'Subscription not found for this month.'}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(145deg,#0f1117,#0d0f18)",
                border: `1px solid ${isPaid ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                boxShadow: isPaid ? "0 0 32px rgba(34,197,94,0.05)" : "0 0 32px rgba(245,158,11,0.05)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">
                    {subscription.flat_type} · Flat {subscription.flat_number}
                  </p>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {new Date(subscription.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">{subscription.owner_name}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl mt-1"
                  style={isPaid ? {
                    background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)"
                  } : {
                    background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)"
                  }}
                >
                  {isPaid ? "PAID" : "PENDING"}
                </span>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-800">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-white">₹{subscription.amount_due}</p>
              </div>
            </div>

            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Charges Breakdown</h2>

              <div className="space-y-3">
                <Row label="Monthly Maintenance" value={`₹${subscription.monthly_amount ?? subscription.amount_due}`} />
                <Row label="Due Date" value={fmt(subscription.due_date)} />
                <div className="border-t border-slate-800 pt-3 flex justify-between">
                  <span className="text-sm font-bold text-white">Total Due</span>
                  <span className="text-sm font-bold text-white">₹{subscription.amount_due}</span>
                </div>
              </div>
            </div>

            {isPaid && (
              <div className="rounded-2xl p-6 space-y-4"
                style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-3 h-3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Payment Details</h2>
                </div>

                <div className="space-y-3">
                  <Row label="Amount Paid" value={`₹${subscription.amount_paid}`} highlight />
                  <Row label="Payment Mode" value={subscription.payment_mode
                    ? subscription.payment_mode.charAt(0).toUpperCase() + subscription.payment_mode.slice(1)
                    : '—'} />
                  <Row label="Payment Date" value={fmt(subscription.paid_at)} />
                  <Row label="Payment Time" value={fmtTime(subscription.paid_at)} />
                  {subscription.transaction_ref && (
                    <Row label="Transaction Ref" value={subscription.transaction_ref} mono />
                  )}
                </div>
              </div>
            )}

            {!isPaid && (
              <Link href="/pay-now">
                <div className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all"
                  style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 4px 24px rgba(34,197,94,0.15)" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(34,197,94,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(34,197,94,0.15)"}
                >
                  <div>
                    <p className="text-white font-bold text-sm">Pay Now</p>
                    <p className="text-green-200/70 text-xs mt-0.5">Clear your dues for this month</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5 opacity-80">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            )}
          </>
        )}
      </div>
    </ResidentLayout>
  );
}

function Row({ label, value, highlight, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-green-400" : "text-white"} ${mono ? "font-mono text-xs tracking-wide" : ""}`}>
        {value}
      </span>
    </div>
  );
}
