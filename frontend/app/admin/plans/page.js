"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function PlansPage() {

  const [plans, setPlans] = useState([]);

  const [editing, setEditing] = useState(null);
  const [amount, setAmount] = useState("");



  /* ====================
     LOAD
  ==================== */

  const loadPlans = async () => {

    const res = await fetch(`${API}/plans`);
    const data = await res.json();

    setPlans(data.plans || []);

  };

  useEffect(() => {
    loadPlans();
  }, []);



  /* ====================
     SAVE
  ==================== */

  const savePlan = async () => {

    await fetch(`${API}/plans/${editing}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monthly_amount: amount,
      }),
    });

    setEditing(null);
    loadPlans();

  };



  return (

    <div className="max-w-7xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
        Subscription Plans
      </h1>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {plans.map((p) => (

          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700 transition-colors flex flex-col"
          >

            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              {p.flat_type}
            </h2>


            <p className="text-4xl font-bold text-white mb-8 tracking-tight">

              ₹ {p.monthly_amount}

            </p>

            <div className="mt-auto">
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-indigo-500/20 shadow-sm text-sm"
                onClick={() => {

                  setEditing(p.id);
                  setAmount(p.monthly_amount);

                }}
              >
                Edit Plan
              </button>
            </div>

          </div>

        ))}

      </div>



      {editing && (

        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl">

            <h2 className="text-xl font-bold text-white mb-4">Edit Amount</h2>


            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>


            <div className="flex gap-3 mt-8">

              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-indigo-500/20 shadow-sm"
                onClick={savePlan}
              >
                Save
              </button>

              <button
                className="flex-1 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-slate-700 shadow-sm text-slate-300"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}