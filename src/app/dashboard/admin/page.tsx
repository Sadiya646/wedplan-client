"use client";

import { useEffect, useState } from "react";
import { Users, Sparkles, CalendarCheck, CheckCircle2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  role?: string;
  isBlocked?: boolean;
}

interface AdminService {
  _id: string;
  title: string;
  vendorName?: string;
  category: string;
  price: number;
}

interface AdminBooking {
  _id: string;
  serviceTitle: string;
  customerEmail: string;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAdminOverview() {
      try {
        const [usersRes, servicesRes, bookingsRes] = await Promise.all([
          authFetch(`${API_BASE}/api/admin/users`),
          authFetch(`${API_BASE}/api/services`),
          authFetch(`${API_BASE}/api/admin/bookings`),
        ]);

        if (active) {
          if (usersRes.ok) {
            const uData = await usersRes.json();
            setUsers(Array.isArray(uData) ? uData : uData.users || []);
          }
          if (servicesRes.ok) {
            const sData = await servicesRes.json();
            setServices(Array.isArray(sData) ? sData : sData.services || []);
          }
          if (bookingsRes.ok) {
            const bData = await bookingsRes.json();
            setBookings(Array.isArray(bData) ? bData : bData.bookings || []);
          }
        }
      } catch {
        if (active) {
          setUsers([]);
          setServices([]);
          setBookings([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminOverview();
    return () => {
      active = false;
    };
  }, []);

  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;

  const stats = [
    {
      label: "TOTAL USERS",
      value: loading ? "—" : users.length,
      icon: Users,
    },
    {
      label: "TOTAL SERVICES",
      value: loading ? "—" : services.length,
      icon: Sparkles,
    },
    {
      label: "TOTAL BOOKINGS",
      value: loading ? "—" : bookings.length,
      icon: CalendarCheck,
    },
    {
      label: "ACCEPTED BOOKINGS",
      value: loading ? "—" : acceptedCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1F1A1D] sm:text-4xl">
          Admin Control Center
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Platform-wide overview of registered accounts, vendor packages, and
          wedding bookings.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-[#E6DCD2] bg-white p-5 shadow-2xs"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B5E62]">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-3xl font-bold text-[#1F1A1D]">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8ECEE] text-[#5E1929]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        <h2 className="border-b border-[#E6DCD2] pb-4 font-serif text-xl font-bold text-[#1F1A1D]">
          Recent Services in Marketplace
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-[#6B5E62]">
            Loading marketplace summary...
          </p>
        ) : services.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#6B5E62]">
            No services listed on the platform yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {services.slice(0, 6).map((srv) => (
              <div
                key={srv._id}
                className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1F1A1D]">
                    {srv.title}
                  </p>
                  <p className="text-xs text-[#6B5E62]">
                    {srv.vendorName || "Studio"} • {srv.category}
                  </p>
                </div>
                <span className="font-serif text-sm font-bold text-[#5E1929]">
                  ${Number(srv.price || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}