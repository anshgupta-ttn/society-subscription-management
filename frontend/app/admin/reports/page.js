"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

export default function ReportsPage() {

  const API = "http://localhost:5000/api/reports";

  const [tab, setTab] = useState("monthly");

  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);

  const [summary, setSummary] = useState(null);
  const [modes, setModes] = useState([]);
  const [yearly, setYearly] = useState([]);



  const fetchMonthly = async () => {

    try {

      const res = await fetch(
        `${API}/monthly?month=${month}&year=${year}`
      );

      const data = await res.json();

      setSummary(data.summary || null);
      setModes(data.modes || []);

    } catch (err) {
      console.log(err);
    }

  };



  const fetchYearly = async () => {

    try {

      const res = await fetch(
        `${API}/yearly?year=${year}`
      );

      const data = await res.json();

      setYearly(data.monthly || []);

    } catch (err) {
      console.log(err);
    }

  };



  useEffect(() => {

    if (tab === "monthly") fetchMonthly();
    else fetchYearly();

  }, [tab, month, year]);



  const downloadCSV = () => {

    if (!summary) return;

    let csv = "Name,Value\n";

    csv += `Total Flats,${summary.total_flats}\n`;
    csv += `Billable,${summary.billable}\n`;
    csv += `Collected,${summary.collected}\n`;
    csv += `Pending,${summary.pending}\n`;

    modes.forEach(m => {
      csv += `${m.payment_mode},${m.total}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };



  const downloadPDF = () => {

    if (!summary) return;

    const monthNames = ["January","February","March","April","May","June",
      "July","August","September","October","November","December"];
    const monthName = monthNames[Number(month) - 1] || month;

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Report", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${monthName} ${year}`, pageW - 14, 18, { align: "right" });

    doc.setTextColor(30, 30, 30);

    let y = 42;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 120);
    doc.text("SUMMARY", 14, y);
    y += 6;

    const summaryRows = [
      ["Total Flats", String(summary.total_flats)],
      ["Billable", `Rs. ${summary.billable}`],
      ["Collected", `Rs. ${summary.collected}`],
      ["Pending", `Rs. ${summary.pending}`],
    ];

    const colW = [90, 80];
    const rowH = 9;

    doc.setFillColor(79, 70, 229);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(14, y, colW[0], rowH, "F");
    doc.rect(14 + colW[0], y, colW[1], rowH, "F");
    doc.text("Metric", 18, y + 6);
    doc.text("Value", 14 + colW[0] + 4, y + 6);
    y += rowH;

    doc.setFont("helvetica", "normal");
    summaryRows.forEach(([label, value], i) => {
      doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 250 : 255);
      doc.rect(14, y, colW[0], rowH, "F");
      doc.rect(14 + colW[0], y, colW[1], rowH, "F");
      doc.setTextColor(30, 30, 30);
      doc.text(label, 18, y + 6);
      doc.text(value, 14 + colW[0] + 4, y + 6);
      doc.setDrawColor(220, 220, 230);
      doc.rect(14, y, colW[0] + colW[1], rowH, "S");
      y += rowH;
    });

    if (modes.length > 0) {
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 120);
      doc.text("PAYMENT MODES BREAKDOWN", 14, y);
      y += 6;

      doc.setFillColor(79, 70, 229);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, y, colW[0], rowH, "F");
      doc.rect(14 + colW[0], y, colW[1], rowH, "F");
      doc.text("Mode", 18, y + 6);
      doc.text("Amount", 14 + colW[0] + 4, y + 6);
      y += rowH;

      doc.setFont("helvetica", "normal");
      modes.forEach((m, i) => {
        doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 250 : 255);
        doc.rect(14, y, colW[0], rowH, "F");
        doc.rect(14 + colW[0], y, colW[1], rowH, "F");
        doc.setTextColor(30, 30, 30);
        doc.text(m.payment_mode, 18, y + 6);
        doc.text(`Rs. ${m.total}`, 14 + colW[0] + 4, y + 6);
        doc.setDrawColor(220, 220, 230);
        doc.rect(14, y, colW[0] + colW[1], rowH, "S");
        y += rowH;
      });
    }

    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 180);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, pageH - 10);

    doc.save(`report_${monthName}_${year}.pdf`);
  };



  const downloadYearlyPDF = () => {

    if (!yearly.length) return;

    const monthNames = ["January","February","March","April","May","June",
      "July","August","September","October","November","December"];

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Yearly Revenue Report", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Year ${year}`, pageW - 14, 18, { align: "right" });

    let y = 42;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 120);
    doc.text("MONTHLY BREAKDOWN", 14, y);
    y += 6;

    const colW = [90, 80];
    const rowH = 9;

    doc.setFillColor(79, 70, 229);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(14, y, colW[0], rowH, "F");
    doc.rect(14 + colW[0], y, colW[1], rowH, "F");
    doc.text("Month", 18, y + 6);
    doc.text("Collected", 14 + colW[0] + 4, y + 6);
    y += rowH;

    let grandTotal = 0;
    doc.setFont("helvetica", "normal");
    yearly.forEach((m, i) => {
      grandTotal += Number(m.total);
      doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 250 : 255);
      doc.rect(14, y, colW[0], rowH, "F");
      doc.rect(14 + colW[0], y, colW[1], rowH, "F");
      doc.setTextColor(30, 30, 30);
      doc.text(monthNames[Number(m.month) - 1] || `Month ${m.month}`, 18, y + 6);
      doc.text(`Rs. ${m.total}`, 14 + colW[0] + 4, y + 6);
      doc.setDrawColor(220, 220, 230);
      doc.rect(14, y, colW[0] + colW[1], rowH, "S");
      y += rowH;
    });

    y += 2;
    doc.setFillColor(79, 70, 229);
    doc.rect(14, y, colW[0] + colW[1], rowH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Total", 18, y + 6);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 14 + colW[0] + 4, y + 6);

    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 180);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, pageH - 10);

    doc.save(`yearly_report_${year}.pdf`);
  };



  const downloadYearlyCSV = () => {

    if (!yearly.length) return;

    const monthNames = ["January","February","March","April","May","June",
      "July","August","September","October","November","December"];

    let csv = "Month,Collected\n";
    let grandTotal = 0;

    yearly.forEach(m => {
      grandTotal += Number(m.total);
      csv += `${monthNames[Number(m.month) - 1] || `Month ${m.month}`},${m.total}\n`;
    });

    csv += `Total,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yearly_report_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (

    <div className="max-w-7xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Reports</h1>



      <div className="flex gap-4 mb-6">

        <button
          onClick={() => setTab("monthly")}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
            tab === "monthly"
              ? "bg-indigo-600 text-white border-indigo-500/20 shadow-sm"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
        >
          Monthly Report
        </button>

        <button
          onClick={() => setTab("yearly")}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
            tab === "yearly"
              ? "bg-indigo-600 text-white border-indigo-500/20 shadow-sm"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
        >
          Yearly Report
        </button>

      </div>



      <div className="flex gap-4 mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm items-end w-fit">

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Month</label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-24 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            min="1" max="12"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            min="2000" max="2100"
          />
        </div>

      </div>



      {tab === "monthly" && summary && (

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">

          <h2 className="text-lg font-semibold text-white mb-6">
            {month}/{year} Summary
          </h2>


          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Flats</div>
              <div className="text-2xl font-bold text-white">{summary.total_flats}</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Billable</div>
              <div className="text-2xl font-bold text-white">₹{summary.billable}</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Collected</div>
              <div className="text-2xl font-bold text-green-400">
                ₹{summary.collected}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">
                ₹{summary.pending}
              </div>
            </div>

          </div>



          <h3 className="mt-8 mb-4 text-sm font-semibold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Payment Modes Breakdown
          </h3>
          
          <div className="space-y-2 mb-8">
            {modes.map((m, i) => (
              <div key={i} className="flex justify-between max-w-xs bg-slate-800/30 p-2.5 rounded border border-slate-700/50">
                <span className="text-slate-300 font-medium">{m.payment_mode}</span>
                <span className="text-white font-bold">₹{m.total}</span>
              </div>
            ))}
          </div>



          <div className="flex gap-4 border-t border-slate-800 pt-6">

            <button
              onClick={downloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm border border-indigo-500/20 shadow-sm"
            >
              Export PDF
            </button>

            <button
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm border border-emerald-500/20 shadow-sm"
            >
              Export CSV
            </button>

          </div>

        </div>

      )}



      {tab === "yearly" && (

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm max-w-lg">

          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2">
            Year {year} Revenue
          </h2>

          <div className="space-y-2">
            {yearly.map((m, i) => (

              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/30">
                <span className="text-slate-300 font-medium">Month {m.month}</span>
                <span className="text-green-400 font-bold">₹{m.total}</span>
              </div>

            ))}
          </div>

          {yearly.length > 0 && (
            <div className="flex gap-4 border-t border-slate-800 pt-6 mt-6">
              <button
                onClick={downloadYearlyPDF}
                className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm border border-indigo-500/20 shadow-sm"
              >
                Export PDF
              </button>
              <button
                onClick={downloadYearlyCSV}
                className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm border border-emerald-500/20 shadow-sm"
              >
                Export CSV
              </button>
            </div>
          )}

        </div>

      )}

    </div>
  );
}