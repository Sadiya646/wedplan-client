"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface BookingItem {
  _id: string;
  serviceTitle: string;
  vendorName: string;
  eventDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchBookings() {
      try {
        const res = await fetch(
          `${API_BASE}/api/bookings/customer?email=${encodeURIComponent(
            userEmail!
          )}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          if (isMounted) setBookings([]);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setBookings(Array.isArray(data) ? data : data.bookings || []);
        }
      } catch {
        if (isMounted) setBookings([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  const totalRequests = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  const stats = [
    {
      label: "TOTAL REQUESTS",
      value: loading ? "—" : totalRequests,
      icon: CalendarHeart,
    },
    {
      label: "PENDING",
      value: loading ? "—" : pendingCount,
      icon: Clock,
    },
    {
      label: "ACCEPTED",
      value: loading ? "—" : acceptedCount,
      icon: CheckCircle2,
    },
    {
      label: "REJECTED",
      value: loading ? "—" : rejectedCount,
      icon: XCircle,
    },
  ];

  return (
    <div>
      {/* Header */}
      <h1 className="font-serif text-3xl font-bold text-[#1F1A1D] sm:text-4xl">
        Welcome back, {session?.user?.name || "Member"}
      </h1>
      <p className="mt-1.5 text-sm text-[#6B5E62]">
        Here is a summary of your wedding vendor inquiries and confirmed
        bookings.
      </p>

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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8ECEE] text-[#5E1929]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Booking Activity Card */}
      <div className="mt-8 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-4">
          <h2 className="font-serif text-xl font-bold text-[#1F1A1D]">
            Recent Booking Activity
          </h2>
          {bookings.length > 0 && (
            <Link
              href="/dashboard/customer/bookings"
              className="text-xs font-semibold text-[#5E1929] hover:underline"
            >
              Manage All
            </Link>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-[#6B5E62]">
            Loading your bookings...
          </p>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-serif text-lg font-bold text-[#1F1A1D]">
              No booking requests yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#6B5E62]">
              Explore wedding venues, photographers, and decorators to request
              your event date.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#46111E]"
            >
              <span>Browse Wedding Services</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1F1A1D]">
                    {booking.serviceTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B5E62]">
                    {booking.vendorName} • Event Date: {booking.eventDate}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === "ACCEPTED"
                      ? "bg-emerald-100 text-emerald-800"
                      : booking.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}