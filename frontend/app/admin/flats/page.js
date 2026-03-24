"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function FlatsPage() {
  const [flats, setFlats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [form, setForm] = useState({
    flat_number: "", owner_name: "", flat_type: "1BHK",
    owner_email: "", owner_phone: "", is_active: true, password: "",
  });

  const loadFlats = async () => {
    const res = await fetch(`${API}/flats`);
    const data = await res.json();
    setFlats(data.flats || []);
  };

  useEffect(() => { loadFlats(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const saveFlat = async () => {
    if (!editing && !form.password) {
      alert("Password is required when adding a new flat.");
      return;
    }
    if (editing) {
      await fetch(`${API}/flats/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`${API}/flats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    loadFlats();
  };

  const deleteFlat = async (id) => {
    await fetch(`${API}/flats/${id}`, { method: "DELETE" });
    loadFlats();
  };

  const filtered = search.trim()
    ? flats.filter((f) => f.flat_number.toLowerCase().includes(search.trim().toLowerCase()))
    : flats;

  const start = (page - 1) * perPage;
  const current = filtered.slice(start, start + perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Flats Management</h1>
          <p className="text-slate-400 text-sm">{filtered.length} flats {search ? "found" : "registered"}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by flat ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-52"
          />
          <button
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-indigo-500/20 shadow-sm text-sm"
            onClick={() => {
              setEditing(null);
              setForm({ flat_number: "", owner_name: "", flat_type: "1BHK", owner_email: "", owner_phone: "", is_active: true, password: "" });
              setShowForm(true);
            }}
          >
            + Add Flat
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Flat</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Owner</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</th>
                <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-sm">
                    No flats found{search ? ` for "${search}"` : ""}.
                  </td>
                </tr>
              ) : current.map((f) => (
                <tr key={f.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors last:border-0">
                  <td className="py-4 px-6 font-medium">{f.flat_number}</td>
                  <td className="py-4 px-6">{f.owner_name}</td>
                  <td className="py-4 px-6 text-slate-300">{f.flat_type}</td>
                  <td className="py-4 px-6 text-slate-300">{f.owner_email}</td>
                  <td className="py-4 px-6 text-slate-300">{f.owner_phone}</td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <button
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      onClick={() => { setEditing(f.id); setForm({ ...f, password: "" }); setShowForm(true); }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      onClick={() => deleteFlat(f.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <span className="text-sm text-slate-400">
            Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
          </span>
          <div className="flex space-x-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors text-sm font-medium">Previous</button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors text-sm font-medium">Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{editing ? "Edit Flat Details" : "Add New Flat"}</h2>
            <div className="space-y-4">
              {[
                { name: "flat_number", label: "Flat Number", placeholder: "e.g. A-101" },
                { name: "owner_name", label: "Owner Name", placeholder: "Full Name" },
                { name: "owner_email", label: "Email Address", placeholder: "Email" },
                { name: "owner_phone", label: "Phone Number", placeholder: "Phone" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Flat Type</label>
                <select name="flat_type" value={form.flat_type} onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-slate-800 [&>option]:text-white">
                  <option>1BHK</option>
                  <option>2BHK</option>
                  <option>3BHK</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {editing ? "Reset Password (leave blank to keep current)" : "Password *"}
                </label>
                <input name="password" type="text"
                  placeholder={editing ? "Enter new password to reset" : "Set resident login password"}
                  value={form.password} onChange={handleChange} required={!editing}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500" />
                {!editing && <p className="text-[11px] text-slate-600 mt-1">Share this with the resident for their first login.</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-indigo-500/20 shadow-sm" onClick={saveFlat}>Save</button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-slate-700 shadow-sm text-slate-300" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
