"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function formatMonth(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "10px 14px",
  color: "white",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function PaymentsPage() {
  const [flats, setFlats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [flatId, setFlatId] = useState("");
  const [pendingMonths, setPendingMonths] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${API}/payments/flats`).then((r) => r.json()).then((d) => setFlats(d.flats || []));
    loadRecent();
  }, []);

  const loadRecent = () => {
    fetch(`${API}/payments/recent`).then((r) => r.json()).then((d) => setRecent(Array.isArray(d) ? d : []));
  };

  const onFlatChange = async (id) => {
    setFlatId(id);
    setSubscriptionId("");
    setAmount("");
    setPendingMonths([]);
    setError("");
    if (!id) return;
    const r = await fetch(`${API}/payments/pending/${id}`);
    const d = await r.json();
    const months = d.pendingMonths || [];
    setPendingMonths(months);
    if (months.length === 0) setError("No pending months for this flat.");
  };

  const onMonthChange = (subId) => {
    setSubscriptionId(subId);
    const sub = pendingMonths.find((m) => m.id === subId);
    setAmount(sub ? sub.amount_due : "");
  };

  const save = async () => {
    setError("");
    setSuccess("");
    if (!flatId) return setError("Select a flat.");
    if (!subscriptionId) return setError("Select a pending month.");
    if (!amount) return setError("Amount is missing.");
    setSaving(true);
    try {
      const res = await fetch(`${API}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flat_id: flatId, subscription_id: subscriptionId, amount, mode, date, note }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to record payment.");
      } else {
        setSuccess("Payment recorded successfully.");
        onFlatChange(flatId);
        loadRecent();
        setNote("");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const modeColors = { Cash: "#22c55e", UPI: "#3b82f6", Online: "#8b5cf6" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payment Entry</h1>
        <p className="text-slate-600 text-sm mt-1">Record a new payment for a flat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <h2 className="text-sm font-semibold text-white">New Payment</h2>

          <Field label="Select Flat">
            <select
              value={flatId}
              onChange={(e) => onFlatChange(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            >
              <option value="" style={{ background: "#0d0f18" }}>Choose flat</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id} style={{ background: "#0d0f18" }}>{f.flat_number}</option>
              ))}
            </select>
          </Field>

          <Field label="Pending Month">
            <select
              value={subscriptionId}
              onChange={(e) => onMonthChange(e.target.value)}
              disabled={pendingMonths.length === 0}
              style={{ ...inputStyle, opacity: pendingMonths.length === 0 ? 0.4 : 1, cursor: pendingMonths.length === 0 ? "not-allowed" : "default" }}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            >
              <option value="" style={{ background: "#0d0f18" }}>
                {flatId ? (pendingMonths.length === 0 ? "No pending months" : "Select month") : "Select flat first"}
              </option>
              {pendingMonths.map((m) => (
                <option key={m.id} value={m.id} style={{ background: "#0d0f18" }}>
                  {formatMonth(m.month)} — ₹{m.amount_due}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Amount">
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
            >
              <span className="text-green-500 font-bold text-lg">₹</span>
              <span className="text-white font-semibold text-sm">{amount || <span className="text-slate-600 font-normal">Auto-filled from plan</span>}</span>
            </div>
          </Field>

          <Field label="Payment Mode">
            <div className="flex gap-2">
              {["Cash", "UPI", "Online"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={mode === m ? {
                    background: `${modeColors[m]}18`,
                    border: `1px solid ${modeColors[m]}40`,
                    color: modeColors[m],
                    boxShadow: `0 2px 12px ${modeColors[m]}20`,
                  } : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#64748b",
                  }}
                >
                  {m === "Cash" ? "💵" : m === "UPI" ? "📱" : "🌐"} {m}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Payment Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />
          </Field>

          <Field label="Note (optional)">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Transaction ref, remarks..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />
          </Field>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" /></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#4ade80" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {success}
            </div>
          )}

          <button
            onClick={save}
            disabled={saving || !subscriptionId}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: saving || !subscriptionId ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: saving || !subscriptionId ? "none" : "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Recording...
              </span>
            ) : "Record Payment"}
          </button>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f1117 0%, #0d0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="text-sm font-semibold text-white">Recent Payments</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">{recent.length} entries</p>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-700 text-sm">No payments yet</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
              {recent.map((r, i) => (
                <div
                  key={i}
                  className="px-5 py-4 flex items-center justify-between transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-4 h-4">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.flat_number}</p>
                      <p className="text-[11px] text-slate-600">{formatDate(r.payment_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#4ade80" }}>₹{r.amount_paid}</p>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md capitalize"
                      style={{ background: `${modeColors[r.payment_mode] || "#6366f1"}18`, color: modeColors[r.payment_mode] || "#a78bfa" }}
                    >
                      {r.payment_mode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
