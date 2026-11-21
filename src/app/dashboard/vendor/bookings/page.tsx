"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface VendorBooking {
  _id: string;
  bookingCode?: string;
  serviceId?: string;
  serviceTitle: string;
  customerName?: string;
  customerEmail?: string;
  vendorEmail?: string;
  eventDate: string;
  location?: string;
  notes?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VendorBookingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const vendorEmail = session?.user?.email;

  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!sessionPending) setLoading(false);
      return;
    }

    let active = true;

    async function loadVendorBookings() {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(vendorEmail!);
        let res = await fetch(
          `${API_BASE}/api/bookings/vendor?email=${encoded}`,
          { credentials: "include" }
        );

        if (res.status === 404) {
          res = await fetch(
            `${API_BASE}/api/bookings?vendorEmail=${encoded}`,
            { credentials: "include" }
          );
        }

        if (!res.ok) {
          if (active) setBookings([]);
          return;
        }

        const data = await res.json();
        const rawList: VendorBooking[] = Array.isArray(data)
          ? data
          : data.bookings || [];

        // Enrich missing location from /api/services
        const locationMap = new Map<string, string>();
        if (rawList.some((b) => !b.location && b.serviceId)) {
          try {
            const sRes = await fetch(`${API_BASE}/api/services`);
            if (sRes.ok) {
              const sData = await sRes.json();
              const sList = Array.isArray(sData) ? sData : sData.services || [];
              sList.forEach((s: { _id: string; location?: string }) => {
                if (s.location) locationMap.set(s._id, s.location);
              });
            }
          } catch {
            // Optional enrichment
          }
        }

        const enriched = rawList.map((b) => ({
          ...b,
          location: b.location || (b.serviceId ? locationMap.get(b.serviceId) : ""),
        }));

        if (active) setBookings(enriched);
      } catch {
        if (active) setBookings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVendorBookings();
    return () => {
      active = false;
    };
  }, [vendorEmail, sessionPending]);

  const handleDecision = async (
    bookingId: string,
    decision: "ACCEPTED" | "REJECTED"
  ) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: decision }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || `Failed to ${decision.toLowerCase()} booking`);
        return;
      }

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: decision } : b))
      );

      toast.success(
        decision === "ACCEPTED"
          ? "Booking accepted! Decision is now final."
          : "Booking request rejected."
      );
    } catch {
      toast.error("Something went wrong while submitting decision");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1F1A1D] sm:text-4xl">
          Customer Booking Requests
        </h1>
        <p className="mt-1 text-xs text-[#6B5E62] sm:text-sm">
          Review and respond to incoming couple inquiries. Decisions are final
          once submitted.
        </p>
      </div>

      {/* Booking Cards */}
      {loading || sessionPending ? (
        <div className="mt-14 flex items-center justify-center gap-2 text-sm text-[#6B5E62]">
          <Loader2 className="h-5 w-5 animate-spin text-[#5E1929]" />
          <span>Loading booking requests...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#ECE2D6] bg-white p-12 text-center shadow-2xs">
          <h2 className="font-serif text-2xl font-bold text-[#1F1A1D]">
            No Booking Requests Yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-[#6B5E62]">
            When couples submit inquiries for your wedding packages, they will
            appear here for your review.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          {bookings.map((booking) => {
            const status = (booking.status || "PENDING").toUpperCase();
            const isPending = status === "PENDING";
            const shortId =
              booking.bookingCode || `bk_${booking._id.slice(-4)}`;

            return (
              <article
                key={booking._id}
                className="rounded-3xl border border-[#ECE2D6] bg-white p-6 shadow-[0_2px_12px_rgba(31,26,29,0.02)] sm:p-7"
              >
                {/* Top Row: Status + Booking ID (left) | Event Date + Location (right) */}
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {status === "ACCEPTED" ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        ACCEPTED
                      </span>
                    ) : status === "REJECTED" || status === "CANCELLED" ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        {status}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        PENDING
                      </span>
                    )}

                    <span className="text-xs text-[#7D6F73]">
                      Booking ID: {shortId}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-[#3D3337]">
                      Event Date: {booking.eventDate}
                    </p>
                    {booking.location && (
                      <p className="mt-0.5 text-xs text-[#6B5E62]">
                        {booking.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title & Customer Info */}
                <h2 className="mt-3 font-serif text-xl font-bold text-[#1F1A1D] sm:text-2xl">
                  {booking.serviceTitle}
                </h2>

                <p className="mt-1 text-xs text-[#6B5E62]">
                  Customer:{" "}
                  <span className="font-semibold text-[#1F1A1D]">
                    {booking.customerName || "Couple"}
                  </span>
                  {booking.customerEmail ? ` (${booking.customerEmail})` : ""}
                </p>

                {/* Couple's Note Box */}
                {booking.notes && (
                  <div className="mt-4 rounded-xl bg-[#F8F5F0] px-4 py-3.5 text-xs leading-relaxed text-[#3D3337]">
                    <span className="font-semibold text-[#1F1A1D]">
                      Couple's Note:{" "}
                    </span>
                    <span>“{booking.notes}”</span>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === booking._id}
                        onClick={() =>
                          handleDecision(booking._id, "REJECTED")
                        }
                        className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100/70 disabled:opacity-50"
                      >
                        Reject Request
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === booking._id}
                        onClick={() =>
                          handleDecision(booking._id, "ACCEPTED")
                        }
                        className="rounded-xl bg-[#0D8A5F] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0A724E] disabled:opacity-50"
                      >
                        {updatingId === booking._id
                          ? "Saving..."
                          : "Accept Booking"}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs italic text-[#8E8185]">
                      Decision final ({status.toLowerCase()})
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}