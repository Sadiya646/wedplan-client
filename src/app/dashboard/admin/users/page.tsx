"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUserRow {
  _id: string;
  name?: string;
  email: string;
  role?: "customer" | "vendor" | "admin";
  businessName?: string;
  isBlocked?: boolean;
  loginCount?: number;
  lastLogin?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (active) setUsers([]);
          return;
        }
        const data = await res.json();
        if (active) {
          setUsers(Array.isArray(data) ? data : data.users || []);
        }
      } catch {
        if (active) setUsers([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateUser = async (
    userId: string,
    payload: { role?: "customer" | "vendor" | "admin"; isBlocked?: boolean }
  ) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to update user");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...payload } : u))
      );
      toast.success("Account updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
          Users & Roles
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Manage user roles across Customer, Vendor, and Admin portals or
          suspend accounts.
        </p>
      </div>

      <div className="mt-7 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            Loading registered users...
          </p>
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            No registered users found.
          </p>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {users.map((u) => {
              const currentRole = u.role || "customer";
              return (
                <div
                  key={u._id}
                  className="flex flex-col justify-between gap-4 py-4 lg:flex-row lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#1F1A1D]">
                        {u.name || "Unnamed User"}
                      </p>
                      {u.isBlocked && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-800">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B5E62]">
                      {u.email}
                      {u.businessName ? ` • ${u.businessName}` : ""}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#8A7C81]">
                      Logins: {u.loginCount ?? 0}
                      {u.lastLogin
                        ? ` • Last sign in: ${new Date(
                            u.lastLogin
                          ).toLocaleString()}`
                        : " • Not signed in yet"}
                    </p>




                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      aria-label="User role"
                      disabled={updatingId === u._id}
                      value={currentRole}
                      onChange={(e) =>
                        handleUpdateUser(u._id, {
                          role: e.target.value as
                            | "customer"
                            | "vendor"
                            | "admin",
                        })
                      }
                      className="rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-3 py-2 text-xs font-semibold text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      disabled={updatingId === u._id}
                      onClick={() =>
                        handleUpdateUser(u._id, { isBlocked: !u.isBlocked })
                      }
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                        u.isBlocked
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {u.isBlocked ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Block</span>
                        </>
                      )}
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