'use client';

import { useEffect, useMemo, useState } from 'react';
import API from '@/lib/api';

export default function AdminNotificationsPage() {
  const [flats, setFlats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultMessage, setResultMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    message: '',
    targetType: 'all',
    flatId: '',
  });

  const canSubmit = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return false;
    if (form.targetType === 'flat' && !form.flatId) return false;
    return true;
  }, [form]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flatsRes, notificationsRes] = await Promise.all([
        fetch(`${API}/flats`),
        fetch(`${API}/notifications`),
      ]);

      const flatsData = await flatsRes.json();
      const notificationsData = await notificationsRes.json();

      setFlats(flatsData.flats || []);
      setNotifications(notificationsData.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitNotification = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSending(true);
      setResultMessage('');

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        targetType: form.targetType,
      };

      if (form.targetType === 'flat') {
        payload.flatId = form.flatId;
      }

      const res = await fetch(`${API}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setResultMessage('Notification sent successfully.');
        setForm((prev) => ({ ...prev, title: '', message: '' }));
        await loadData();
      } else {
        setResultMessage(data.message || data.error || 'Failed to send notification.');
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
      setResultMessage('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Notifications</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-white">Send Notification</h2>

            <form onSubmit={submitNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target</label>
                <select
                  value={form.targetType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetType: e.target.value,
                      flatId: e.target.value === 'all' ? '' : prev.flatId,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="all">All Flats</option>
                  <option value="flat">Specific Flat</option>
                </select>
              </div>

              {form.targetType === 'flat' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Select Flat</label>
                  <select
                    value={form.flatId}
                    onChange={(e) => setForm((prev) => ({ ...prev, flatId: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white"
                  >
                    <option value="">Choose flat</option>
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.flat_number} - {flat.owner_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                  placeholder="Enter title"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="h-28 w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500 resize-none"
                  placeholder="Write notification message"
                  maxLength={500}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit || sending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-indigo-500/20 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-white"
                >
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>

            {resultMessage && (
              <p className="mt-3 rounded bg-slate-800 p-2 text-sm text-slate-200">{resultMessage}</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Notifications</h2>
              <button
                type="button"
                onClick={loadData}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-slate-400">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="font-medium text-white">{item.title}</p>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {new Date(item.sent_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.message}</p>
                    <p className="mt-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Target: <span className="text-slate-400">{item.target_type === 'all' ? 'All flats' : `Flat ID ${item.target_id}`}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
