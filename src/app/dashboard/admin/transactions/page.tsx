"use client";

import { useEffect, useState } from "react";
import { Loader2, Receipt, CheckCircle2, Search, AlertCircle } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface TransactionItem {
  _id: string;
  vendorName?: string;
  vendorEmail?: string;
  plan?: string;
  amount?: number;
  currency?: string;
  stripeSessionId?: string;
  status?: string;
  createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch(`${API_BASE}/api/admin/transactions`);

        if (!res.ok) {
          throw new Error("Failed to load transactions from server.");
        }

        const data = await res.json();
        if (active) {
          setTransactions(data.transactions || []);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load transactions."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTransactions();
    return () => {
      active = false;
    };
  }, []);

  const filtered = transactions.filter((tx) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (tx.vendorName || "").toLowerCase().includes(q) ||
      (tx.vendorEmail || "").toLowerCase().includes(q) ||
      (tx.plan || "").toLowerCase().includes(q) ||
      (tx.stripeSessionId || "").toLowerCase().includes(q)
    );
  });

  const totalRevenue = transactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88D2F]">
            PLATFORM BILLING
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#1F1A1D]">
            Subscription Transactions
          </h1>
          <p className="mt-1 text-xs text-[#6B5E62] sm:text-sm">
            Verified Stripe subscription payments (read-only audit log).
          </p>
        </div>

        <div className="rounded-2xl border border-[#ECE2D6] bg-white px-5 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8185]">
            Total Revenue
          </p>
          <p className="font-serif text-2xl font-bold text-[#5E1929]">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#ECE2D6] bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-[#8E8185]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor name, email, plan, or Stripe session ID..."
          className="w-full bg-transparent text-xs text-[#1F1A1D] outline-none placeholder:text-[#9A8E92] sm:text-sm"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-[#ECE2D6] bg-white shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#6B5E62]">
            <Loader2 className="h-5 w-5 animate-spin text-[#5E1929]" />
            <span>Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Receipt className="h-8 w-8 text-[#B8AEB1]" />
            <p className="text-sm font-semibold text-[#3D3337]">
              No transactions found
            </p>
            <p className="text-xs text-[#8E8185]">
              Completed Vendor Premium Stripe payments will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[#F1E9DF] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#6B5E62]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Vendor</th>
                  <th className="px-5 py-3.5 font-semibold">Plan</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E9DF]">
                {filtered.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#FCF9F5]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1F1A1D]">
                        {tx.vendorName || "Vendor"}
                      </p>
                      <p className="text-xs text-[#6B5E62]">{tx.vendorEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#1C1214] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D6B15C]">
                        {tx.plan || "PREMIUM"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#1F1A1D]">
                      ${Number(tx.amount || 0).toFixed(2)}{" "}
                      <span className="text-[11px] font-normal text-[#8E8185]">
                        {tx.currency || "USD"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {tx.status || "SUCCESS"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6B5E62]">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}