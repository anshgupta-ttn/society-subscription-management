'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/resident/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('resident', JSON.stringify(data.resident));
        localStorage.setItem('resident_token', data.token);
        document.cookie = `resident_session=1; path=/; SameSite=Lax`;
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials. Please contact your admin.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080a12" }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />

      <div className="w-full max-w-sm relative z-10">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 24px rgba(59,130,246,0.35)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none tracking-tight">
              Society<span style={{ color: "#60a5fa" }}>Management</span>
            </p>
            <p className="text-slate-600 text-xs mt-0.5 tracking-widest uppercase">Resident Portal</p>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-7">Enter your credentials to sign in</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2.5"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <p className="text-[11px] text-slate-700">Registered residents only</p>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Admin?{' '}
          <a href="/admin/login" className="text-slate-500 hover:text-white transition-colors">
            Go to admin panel →
          </a>
        </p>
      </div>
    </div>
  );
}
