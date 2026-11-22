"use client";

import { useEffect, useState } from "react";
import { Calendar, Users } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface AdminBookingRow {
  _id: string;
  serviceTitle: string;
  vendorName?: string;
  customerName?: string;
  customerEmail: string;
  eventDate: string;
  guestCount?: number;
  price?: number;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchAllBookings() {
      try {
        const res = await authFetch(`${API_BASE}/api/admin/bookings`);
        if (!res.ok) {
          if (active) setBookings([]);
          return;
        }
        const data = await res.json();
        if (active) {
          setBookings(Array.isArray(data) ? data : data.bookings || []);
        }
      } catch {
        if (active) setBookings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAllBookings();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
          All Platform Bookings
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Real-time log of all wedding booking inquiries across studios and
          couples.
        </p>
      </div>

      <div className="mt-7 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            Loading bookings...
          </p>
        ) : bookings.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            No bookings submitted yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {bookings.map((bk) => (
              <div
                key={bk._id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1F1A1D]">
                    {bk.serviceTitle}
                  </h2>
                  <p className="text-xs text-[#6B5E62]">
                    Studio: {bk.vendorName || "Studio"} • Couple:{" "}
                    {bk.customerName || "Couple"} ({bk.customerEmail})
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-[#6B5E62]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#C59B47]" />
                      <span>{bk.eventDate}</span>
                    </span>
                    {bk.guestCount && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#C59B47]" />
                        <span>{bk.guestCount} Guests</span>
                      </span>
                    )}
                    {typeof bk.price === "number" && bk.price > 0 && (
                      <span className="font-semibold text-[#5E1929]">
                        ${bk.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    bk.status === "ACCEPTED"
                      ? "bg-emerald-100 text-emerald-800"
                      : bk.status === "REJECTED" || bk.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {bk.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}