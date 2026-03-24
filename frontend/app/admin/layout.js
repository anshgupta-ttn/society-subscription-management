"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full z-40 transition-transform duration-300
        lg:static lg:translate-x-0 lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-white font-bold text-base">
            Society<span className="text-violet-400">Management</span>
          </span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
