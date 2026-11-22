"use client";

import { useEffect, useState } from "react";
import { MapPin, Trash2, Search, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type ServiceStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminServiceItem {
  _id: string;
  title: string;
  vendorName?: string;
  vendorEmail?: string;
  category: string;
  location: string;
  price: number;
  status?: ServiceStatus;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminAllServicesPage() {
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ServiceStatus>(
    "ALL"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchServices() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/services`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (active) setServices([]);
          return;
        }
        const data = await res.json();
        if (active) {
          setServices(Array.isArray(data) ? data : data.services || []);
        }
      } catch {
        if (active) setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (id: string, nextStatus: ServiceStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/services/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update service status");
        return;
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: nextStatus } : item
        )
      );
      toast.success(`Service marked as ${nextStatus}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Failed to remove service");
        return;
      }
      setServices((prev) => prev.filter((item) => item._id !== id));
      toast.success("Service removed from marketplace");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = services.filter((s) => {
    const currentStatus = (s.status || "PENDING").toUpperCase();
    if (statusFilter !== "ALL" && currentStatus !== statusFilter) {
      return false;
    }

    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      (s.vendorName || "").toLowerCase().includes(q) ||
      (s.vendorEmail || "").toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
            All Marketplace Services
          </h1>
          <p className="mt-1 text-sm text-[#6B5E62]">
            Review pending submissions, approve or reject listings, and moderate
            packages.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | ServiceStatus)
            }
            className="rounded-xl border border-[#E2D6C8] bg-white px-3 py-2 text-xs font-semibold text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E62]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter services..."
              className="w-full rounded-xl border border-[#E2D6C8] bg-white py-2 pl-9 pr-3 text-xs text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            Loading services...
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            No services found.
          </p>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {filtered.map((srv) => {
              const currentStatus = (
                srv.status || "PENDING"
              ).toUpperCase() as ServiceStatus;
              const isBusy = updatingId === srv._id || deletingId === srv._id;

              return (
                <div
                  key={srv._id}
                  className="flex flex-col justify-between gap-4 py-4 lg:flex-row lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-[#1F1A1D]">
                        {srv.title}
                      </h2>
                      <span className="rounded-full bg-[#F2E2E4] px-2.5 py-0.5 text-[10px] font-bold text-[#5E1929]">
                        {srv.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          currentStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : currentStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B5E62]">
                      Vendor: {srv.vendorName || "Studio"} (
                      {srv.vendorEmail || "N/A"})
                    </p>
                    <div className="mt-1.5 flex items-center gap-4 text-xs text-[#6B5E62]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#C59B47]" />
                        <span>{srv.location}</span>
                      </span>
                      <span className="font-semibold text-[#5E1929]">
                        ${Number(srv.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentStatus !== "APPROVED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(srv._id, "APPROVED")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {currentStatus !== "REJECTED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(srv._id, "REJECTED")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(srv._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>
                        {deletingId === srv._id ? "Removing..." : "Remove"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}