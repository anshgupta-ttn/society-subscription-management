'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResidentLayout from '@/app/components/ResidentLayout';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (!stored) { router.push('/login'); return; }
    const r = JSON.parse(stored);
    setResident(r);
    fetchSubscriptions(r.id);
  }, [router]);

  const fetchSubscriptions = async (flatId) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/resident/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flatId }),
      });
      const data = await res.json();
      if (data.success) setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const paid = subscriptions.filter(s => s.status === 'paid').length;
  const pending = subscriptions.filter(s => s.status !== 'paid').length;

  return (
    <ResidentLayout>
      <div className="p-6 space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
            <p className="text-slate-400 text-sm mt-1">Flat {resident?.flat_number}</p>
          </div>
          <button
            onClick={() => fetchSubscriptions(resident?.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="flex gap-3">
          <span className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">{paid} Paid</span>
          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">{pending} Pending</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">No subscriptions found</div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <Link key={sub.id} href={"/subscriptions/" + sub.month}>
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-4 flex items-center justify-between transition-all cursor-pointer group mb-2">
                  <div className="flex items-center gap-3">
                    <div className={"w-2 h-2 rounded-full " + (sub.status === 'paid' ? 'bg-green-400' : 'bg-yellow-400')} />
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {new Date(sub.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Due: {new Date(sub.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-white">Rs.{sub.amount_due}</p>
                    <span className={"text-xs font-semibold px-2.5 py-1 rounded-full border " + (sub.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20')}>
                      {sub.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ResidentLayout>
  );
}
