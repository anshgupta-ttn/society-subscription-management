'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResidentLayout from '@/app/components/ResidentLayout';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function PayNowPage() {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMode, setPaymentMode] = useState('online');

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (!stored) {
      router.push('/login');
      return;
    }
    setResident(JSON.parse(stored));
    fetchSubscriptions(JSON.parse(stored).id);
  }, [router]);

  const fetchSubscriptions = async (flatId) => {
    try {
      const response = await fetch('http://localhost:5000/api/resident/subscriptions', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ flatId }),
      });

      const data = await response.json();
      if (data.success) {
        const pending = data.subscriptions?.filter(
          (sub) => sub.status !== 'paid' && sub.status !== 'Paid'
        ) || [];
        setSubscriptions(pending);
        if (pending.length > 0) {
          setSelectedMonth(pending[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const selectedSubscription = subscriptions.find((sub) => sub.id === selectedMonth);
  const amount = selectedSubscription?.amount_due || 0;
  const monthDisplay = selectedSubscription
    ? new Date(selectedSubscription.month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);

    try {
      const transactionRef = `TXN-${Date.now()}`;
      
      const payloadData = {
        flatId: resident?.id,
        subscriptionId: selectedMonth,
        amount,
        paymentMode,
        transactionRef,
      };
      
      console.log("Sending payment:", payloadData);

      const response = await fetch('http://localhost:5000/api/resident/payment', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(payloadData),
      });

      const data = await response.json();
      
      console.log("Payment response:", data);

      if (data.success) {
        await fetchSubscriptions(resident?.id);
        
        const updatedSubs = subscriptions.filter((sub) => sub.id !== selectedMonth);
        setSubscriptions(updatedSubs);
        
        if (updatedSubs.length > 0) {
          setSelectedMonth(updatedSubs[0].id);
        } else {
          setSelectedMonth('');
        }

        setSuccess(true);
        setTimeout(() => {
          if (updatedSubs.length === 0) {
            router.push('/dashboard');
          } else {
            setSuccess(false);
          }
        }, 2000);
      } else {
        setError(data.message || 'Payment failed');
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError('Error processing payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const content = (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Pay Your Subscription</h1>
        <p className="text-slate-400">Select a month and pay</p>
      </div>

      {success ? (
        <div className="bg-green-500/10 p-6 border border-green-500/20 rounded-xl text-center shadow-sm">
          <p className="text-xl font-bold text-green-400 mb-2 tracking-wide">✓ Payment Successful!</p>
          <p className="text-green-500 text-sm font-medium">Your payment has been recorded. Redirecting...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">
              {error}
            </div>
          )}

          {subscriptions.length > 0 ? (
            <>
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={() => fetchSubscriptions(resident?.id)}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-md transition-colors font-medium"
              >
                Refresh
              </button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Month to Pay
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white"
                  required
                >
                  {subscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {new Date(sub.month).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      - ₹{sub.amount_due}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 border border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Flat</span>
                  <span className="font-medium text-white">{resident?.flat_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Month</span>
                  <span className="font-medium text-white">{monthDisplay}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-sm font-medium text-slate-300">Amount</span>
                  <span className="text-lg font-bold text-green-500">₹{amount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="online">Online (Card/Wallet)</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-400">
                  I agree to pay ₹{amount} for {monthDisplay}
                </label>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm border border-green-500/20 shadow-sm"
              >
                {paying ? 'Processing...' : `Pay ₹${amount}`}
              </button>
            </form>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4 text-sm">No pending subscriptions to pay</p>
              <button
                onClick={() => router.push('/subscriptions')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
              >
                View all subscriptions →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return <ResidentLayout>{content}</ResidentLayout>;
}
