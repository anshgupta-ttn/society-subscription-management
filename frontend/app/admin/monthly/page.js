"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";
const MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"];

export default function MonthlyPage() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const isFuture = (m, y) => y > currentYear || (y === currentYear && m > currentMonth);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ amount: "", mode: "Cash", date: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = () =>
    fetch(`${API}/monthly?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => setRecords(data.records || []));

  const generateAndFetch = async () => {
    await fetch(`${API}/monthly/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    fetchRecords();
  };

  useEffect(() => { generateAndFetch(); }, [month, year]);

  const openModal = (record) => {
    setError("");
    setForm({ amount: record.amount_due, mode: "Cash", date: new Date().toISOString().split("T")[0], note: "" });
    setModal(record);
  };

  const closeModal = () => { setModal(null); setError(""); };

  const handlePay = async () => {
    if (!form.amount || !form.mode || !form.date) { setError("Amount, mode and date are required."); return; }
    if (!modal.flat_id) { setError("flat_id missing — please restart the backend server and try again."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flat_id: modal.flat_id, subscription_id: modal.id, amount: Number(form.amount), mode: form.mode, date: form.date, note: form.note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Payment failed."); return; }
      closeModal();
      generateAndFetch();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Monthly Records</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <button key={m} onClick={() => !isFuture(m, year) && setMonth(m)} disabled={isFuture(m, year)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                month === m ? "bg-indigo-600 text-white border-indigo-500/20 shadow-sm"
                : isFuture(m, year) ? "bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}>{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setYear(y => y - 1)} className="px-2 py-1.5 rounded-md text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">‹</button>
          <span className="px-3 py-1.5 rounded-md text-sm font-semibold bg-slate-800 text-white border border-slate-700 min-w-[60px] text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear} className="px-2 py-1.5 rounded-md text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">›</button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-6 mb-6">
        <div>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-1">Paid</span>
          <span className="text-2xl font-bold text-white">{records.filter(r => r.status === "paid").length}</span>
        </div>
        <div className="w-px h-12 bg-slate-800"></div>
        <div>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-1">Pending</span>
          <span className="text-2xl font-bold text-white">{records.filter(r => r.status === "pending").length}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                {["Flat","Owner","Type","Amount","Status","Action"].map(h => (
                  <th key={h} className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors last:border-0">
                  <td className="py-4 px-6 font-medium text-white">{r.flat_number}</td>
                  <td className="py-4 px-6 text-slate-200">{r.owner_name}</td>
                  <td className="py-4 px-6 text-slate-400">{r.flat_type}</td>
                  <td className="py-4 px-6 text-slate-200 font-medium">₹{r.amount_due}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider border ${
                      r.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}>{r.status?.toUpperCase()}</span>
                  </td>
                  <td className="py-4 px-6">
                    {r.status !== "paid" && (
                      <button onClick={() => openModal(r)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20 transition-colors">
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Mark as Paid</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mb-5 flex gap-6 text-sm">
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Flat</span><span className="text-white font-semibold">{modal.flat_number}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Owner</span><span className="text-white font-semibold">{modal.owner_name}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Month</span><span className="text-white font-semibold">{month}/{year}</span></div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Mode</label>
                <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Transaction Ref / Note <span className="normal-case text-slate-500">(optional)</span></label>
                <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="UPI ref, cheque no, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={handlePay} disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors border border-emerald-500/20">
                {submitting ? "Saving..." : "Confirm Payment"}
              </button>
              <button onClick={closeModal} className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
