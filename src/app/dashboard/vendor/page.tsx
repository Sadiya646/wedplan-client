"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Sparkles, Inbox, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface VendorService {
  _id: string;
  title: string;
  status?: string;
}

interface VendorBooking {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VendorDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        businessName?: string | null;
      }
    | undefined;

  const [services, setServices] = useState<VendorService[]>([]);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let active = true;

    async function loadVendorStats() {
      try {
        const [srvRes, bkRes] = await Promise.all([
          fetch(
            `${API_BASE}/api/services/vendor?email=${encodeURIComponent(
              user!.email!
            )}`,
            { credentials: "include" }
          ),
          fetch(
            `${API_BASE}/api/bookings/vendor?email=${encodeURIComponent(
              user!.email!
            )}`,
            { credentials: "include" }
          ),
        ]);

        if (active) {
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            setServices(
              Array.isArray(srvData) ? srvData : srvData.services || []
            );
          }
          if (bkRes.ok) {
            const bkData = await bkRes.json();
            setBookings(
              Array.isArray(bkData) ? bkData : bkData.bookings || []
            );
          }
        }
      } catch {
        if (active) {
          setServices([]);
          setBookings([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVendorStats();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const totalServices = services.length;
  const activeServices = services.filter(
    (s) => !s.status || s.status === "APPROVED" || s.status === "ACTIVE"
  ).length;
  const pendingRequests = bookings.filter(
    (b) => b.status === "PENDING"
  ).length;
  const acceptedBookings = bookings.filter(
    (b) => b.status === "ACCEPTED"
  ).length;

  const studioTitle =
    user?.businessName ||
    (user?.name ? `${user.name} Studio` : "Atelier Lumière Studio");

  const stats = [
    {
      label: "TOTAL SERVICES",
      value: loading ? "—" : totalServices,
      icon: Layers,
    },
    {
      label: "ACTIVE SERVICES",
      value: loading ? "—" : activeServices,
      icon: Sparkles,
    },
    {
      label: "PENDING REQUESTS",
      value: loading ? "—" : pendingRequests,
      icon: Inbox,
    },
    {
      label: "ACCEPTED BOOKINGS",
      value: loading ? "—" : acceptedBookings,
      icon: CheckCircle2,
    },
  ];

  return (
    <div>
      {/* Top Studio Header + Plan Pill */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1F1A1D] sm:text-[38px]">
            {studioTitle}
          </h1>
          <p className="mt-1 text-sm text-[#6B5E62]">
            Vendor Studio Performance & Booking Pipeline
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-[#F5E6E8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5E1929]">
          FREE PLAN (MAX 3 SERVICES)
        </span>
      </div>

      {/* 4 Stat Cards */}
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

      {/* Dark Upgrade Banner */}
      <div className="mt-7 flex flex-col justify-between gap-6 rounded-3xl bg-[#1C1414] px-7 py-8 text-white shadow-sm sm:px-9 lg:flex-row lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E5B85C]">
            UNLOCK UNLIMITED GROWTH
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-[28px]">
            Upgrade to WedPlan Vendor Premium
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#CFC4C7]">
            Publish unlimited wedding packages, earn the verified Premium Badge,
            and boost your visibility to couples.
          </p>
        </div>

        <Link
          href="/dashboard/vendor/subscription"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#C89D3C] px-6 py-3.5 text-sm font-semibold text-[#1F1A1D] transition hover:bg-[#B88D2F]"
        >
          View Subscription Plans
        </Link>
      </div>
    </div>
  );
}