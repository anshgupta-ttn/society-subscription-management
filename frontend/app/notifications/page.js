'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResidentLayout from '@/app/components/ResidentLayout';
import API from '@/lib/api';

function getResidentFromStorage() {
  try {
    const stored = localStorage.getItem('resident');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (err) {
    console.error('Invalid resident in localStorage:', err);
    return null;
  }
}

function getFlatId(resident) {
  const candidate = resident?.id ?? resident?.flat_id ?? resident?.flatId;
  if (!candidate) return null;
  return String(candidate).trim() || null;
}

export default function ResidentNotificationsPage() {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parsedResident = getResidentFromStorage();
    if (!parsedResident) {
      router.push('/login');
      return;
    }

    const flatId = getFlatId(parsedResident);

    setResident(parsedResident);
    if (flatId) {
      fetchNotifications(flatId);
    } else {
      setLoading(false);
    }
  }, [router]);

  const fetchNotifications = async (flatId) => {
    try {
      setLoading(true);

      const notificationsRes = await fetch(`${API}/notifications?flatId=${flatId}`);
      const notificationsData = await notificationsRes.json();

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications || []);
      }

      await fetch(`${API}/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flatId }),
      });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="p-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1">Flat {resident?.flat_number}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const flatId = getFlatId(resident);
            if (flatId) fetchNotifications(flatId);
          }}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm text-white border border-blue-500/20 shadow-sm transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400 text-center shadow-sm">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400 text-center shadow-sm">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">{new Date(item.sent_at).toLocaleString()}</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{item.message}</p>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.target_type === 'all' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                  {item.target_type === 'all' ? 'Broadcast to all flats' : 'Personal notification'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return <ResidentLayout>{content}</ResidentLayout>;
}
