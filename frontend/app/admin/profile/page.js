'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const name = session?.user?.name || '—';
  const email = session?.user?.email || '—';
  const image = session?.user?.image;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your admin account details</p>
      </div>

      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {image ? (
          <img src={image} alt={name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-white font-bold text-lg">{name}</p>
          <p className="text-slate-400 text-sm">{email}</p>
          <span
            className="inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            Society Admin
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Account Details</h2>

        <div className="space-y-3">
          <Row label="Full Name" value={name} />
          <Row label="Email" value={email} />
          <Row label="Auth Provider" value="Google" />
        </div>
      </div>

      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="w-4 h-4 shrink-0">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
        <p className="text-slate-400 text-xs">
          Your profile is managed by Google. To update your name or photo, edit your Google account.
        </p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: "linear-gradient(145deg,#0f1117,#0d0f18)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Session</h2>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
