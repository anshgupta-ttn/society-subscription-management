"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#22c55e", "#f59e0b"];

function StatCard({ title, value, sub, accent = "#6366f1", icon }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{title}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: accent === "#6366f1" ? "white" : accent }}>{value}</p>
      {sub && <p className="text-[11px] text-slate-700 mt-1.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px' }}>
        <p style={{ color: '#94a3b8', marginBottom: 2 }}>{payload[0].name}</p>
        <p style={{ color: 'white', fontWeight: 600 }}>₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [totalFlats, setTotalFlats] = useState(0);
  const [collectionRate, setCollectionRate] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetch(`${API}/flats/count`).then(r => r.json()).then(d => setTotalFlats(Number(d.total_flats)));
    fetch(`${API}/dashboard/collection-rate`).then(r => r.json()).then(d => setCollectionRate(Number(d.collection_rate)));
    fetch(`${API}/dashboard/total-paid`).then(r => r.json()).then(d => setTotalPaid(Number(d.total_paid)));
    fetch(`${API}/dashboard/pending`).then(r => r.json()).then(d => setPendingAmount(Number(d.pending_amount)));
    fetch(`${API}/dashboard/transactions`).then(r => r.json()).then(d => setTransactions(d.transactions || []));
    fetch(`${API}/dashboard/monthly-collection`).then(r => r.json()).then(d => setMonthlyData(d.data || []));
  }, []);

  const pieData = [
    { name: "Collected", value: totalPaid },
    { name: "Pending", value: pendingAmount },
  ];

  const modeIcon = (mode) => {
    const m = (mode || '').toLowerCase();
    if (m === 'upi') return '📱';
    if (m === 'cash') return '💵';
    return '🌐';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">Society overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Flats"
          value={totalFlats}
          sub="registered units"
          accent="#6366f1"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Collected"
          value={`₹${totalPaid.toLocaleString()}`}
          sub="total received"
          accent="#22c55e"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Pending"
          value={`₹${pendingAmount.toLocaleString()}`}
          sub="outstanding dues"
          accent="#f59e0b"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          sub="this period"
          accent={collectionRate >= 80 ? "#22c55e" : "#f59e0b"}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 17l4-8 4 4 4-6 4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div
          className="col-span-1 lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="text-sm font-semibold text-white mb-1">Collection Overview</h2>
          <p className="text-[11px] text-slate-600 mb-4">Paid vs outstanding</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          className="col-span-1 lg:col-span-3 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">{transactions.length} entries</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #22c55e" }} />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <th className="py-3 px-5 text-left text-[10px] font-bold text-slate-700 uppercase tracking-widest">Flat</th>
                <th className="py-3 px-5 text-left text-[10px] font-bold text-slate-700 uppercase tracking-widest">Resident</th>
                <th className="py-3 px-5 text-left text-[10px] font-bold text-slate-700 uppercase tracking-widest">Amount</th>
                <th className="py-3 px-5 text-left text-[10px] font-bold text-slate-700 uppercase tracking-widest">Mode</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-700 text-xs">No transactions yet</td></tr>
              ) : transactions.map((t, i) => (
                <tr
                  key={i}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td className="py-3.5 px-5 font-semibold text-white">{t.flat}</td>
                  <td className="py-3.5 px-5 text-slate-500">{t.resident}</td>
                  <td className="py-3.5 px-5 font-bold" style={{ color: "#4ade80" }}>₹{t.amount}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {modeIcon(t.mode)} {t.mode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2 className="text-sm font-semibold text-white mb-1">Monthly Collection — {new Date().getFullYear()}</h2>
        <p className="text-[11px] text-slate-600 mb-5">Jan to {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date().getMonth()]}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barSize={32} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}
              width={52}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              content={({ active, payload, label }) => active && payload?.length ? (
                <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px' }}>
                  <p style={{ color: '#94a3b8', marginBottom: 2 }}>{label}</p>
                  <p style={{ color: '#4ade80', fontWeight: 600 }}>₹{Number(payload[0].value).toLocaleString()}</p>
                </div>
              ) : null}
            />
            <Bar dataKey="collected" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
