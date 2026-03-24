"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.push("/admin/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("Access denied. This Google account is not authorized as admin.");
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080a12" }}
    >
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none tracking-tight">
              Society<span style={{ color: "#a78bfa" }}>Management</span>
            </p>
            <p className="text-slate-600 text-xs mt-0.5 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your admin account</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2.5"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <p className="text-[11px] text-slate-700">Only authorized admins</p>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Resident?{' '}
          <a href="/login" className="text-slate-500 hover:text-white transition-colors">
            Go to resident portal →
          </a>
        </p>
      </div>
    </div>
  );
}
