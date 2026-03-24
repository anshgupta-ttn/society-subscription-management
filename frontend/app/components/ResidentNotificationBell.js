'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import API from '@/lib/api';

function getResidentFromStorage() {
  try {
    const stored = localStorage.getItem('resident');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getFlatId(resident) {
  const candidate = resident?.id ?? resident?.flat_id ?? resident?.flatId;
  if (!candidate) return null;
  return String(candidate).trim() || null;
}

export default function ResidentNotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const lastCountRef = useRef(0);

  const showToast = useCallback((title, body) => {
    setToast({ title, body });
    setHasUnread(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchUnread = useCallback(async (targetFlatId) => {
    if (!targetFlatId) return;
    try {
      const res = await fetch(`${API}/notifications/unread-count?flatId=${targetFlatId}`);
      const data = await res.json();
      if (data.success) {
        const count = Number(data.count || 0);
        if (count > lastCountRef.current && lastCountRef.current !== 0) {
          showToast('New Notification', 'You have a new message from admin.');
        }
        lastCountRef.current = count;
        setHasUnread(count > 0);
      }
    } catch {
    }
  }, [showToast]);

  useEffect(() => {
    const resident = getResidentFromStorage();
    const id = getFlatId(resident);
    if (!id) return;

    fetchUnread(id);
    const interval = setInterval(() => fetchUnread(id), 20000);
    const onFocus = () => fetchUnread(id);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      clearTimeout(toastTimer.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnread]);

  return (
    <>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '360px',
            width: '100%',
            background: 'linear-gradient(145deg, #0f1117, #0d0f18)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
            padding: '14px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{
            marginTop: '2px', flexShrink: 0, width: '34px', height: '34px',
            borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
              <path d="M18 16.5v-5a6 6 0 10-12 0v5L4 18h16l-2-1.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{toast.title}</p>
            {toast.body && (
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{toast.body}</p>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <Link
        href="/notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M18 16.5v-5a6 6 0 10-12 0v5L4 18h16l-2-1.5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 18a3 3 0 01-6 0" strokeLinecap="round" />
        </svg>
        {hasUnread && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 0 6px rgba(59,130,246,0.6)" }}
          />
        )}
      </Link>
    </>
  );
}
