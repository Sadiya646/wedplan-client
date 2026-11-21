"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface CustomerBooking {
  _id: string;
  serviceId?: string;
  serviceTitle: string;
  serviceImage?: string;
  image?: string;
  vendorName?: string;
  eventDate: string;
  location?: string;
  price?: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | string;
  createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CustomerBookingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const userEmail = session?.user?.email;

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!sessionPending) setLoading(false);
      return;
    }

    let active = true;

    async function loadBookings() {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(userEmail!);
        let res = await fetch(`${API_BASE}/api/bookings/customer?email=${encoded}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          res = await fetch(`${API_BASE}/api/bookings?customerEmail=${encoded}`, {
            credentials: "include",
          });
        }

        if (!res.ok) {
          if (active) setBookings([]);
          return;
        }

        const data = await res.json();
        const rawList: CustomerBooking[] = Array.isArray(data)
          ? data
          : data.bookings || [];

        // Enrich missing serviceImage & location from /api/services
        const serviceMap = new Map<string, { image?: string; location?: string }>();
        if (rawList.some((b) => !b.serviceImage && !b.image && b.serviceId)) {
          try {
            const sRes = await fetch(`${API_BASE}/api/services`);
            if (sRes.ok) {
              const sData = await sRes.json();
              const sList = Array.isArray(sData) ? sData : sData.services || [];
              sList.forEach((s: { _id: string; image?: string; location?: string }) => {
                serviceMap.set(s._id, { image: s.image, location: s.location });
              });
            }
          } catch {
            // Optional enrichment
          }
        }

        const enriched = rawList.map((b) => {
          const matched = b.serviceId ? serviceMap.get(b.serviceId) : undefined;
          return {
            ...b,
            serviceImage: b.serviceImage || b.image || matched?.image,
            location: b.location || matched?.location,
          };
        });

        if (active) setBookings(enriched);
      } catch {
        if (active) setBookings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      active = false;
    };
  }, [userEmail, sessionPending]);

  const handleCancelRequest = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to cancel request");
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
      toast.success("Booking request cancelled");
    } catch {
      toast.error("Something went wrong while cancelling");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return "2026-11-21";
    return dateStr.slice(0, 10);
  };

  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1F1A1D] sm:text-4xl">
            My Booking Requests
          </h1>
          <p className="mt-1 text-xs text-[#6B5E62] sm:text-sm">
            Track vendor responses or cancel pending booking requests.
          </p>
        </div>

        <Link
          href="/browse-services"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#5E1929] px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#46111E]"
        >
          + Explore More Services
        </Link>
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
            Explore curated venues, photographers, and wedding studios to send
            your first booking request.
          </p>
          <Link
            href="/browse-services"
            className="mt-5 inline-flex rounded-xl bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#46111E]"
          >
            + Explore More Services
          </Link>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {bookings.map((booking) => {
            const status = (booking.status || "PENDING").toUpperCase();
            const thumb = booking.serviceImage || booking.image;

            return (
              <article
                key={booking._id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-[#ECE2D6] bg-white p-5 shadow-[0_2px_10px_rgba(31,26,29,0.02)] transition hover:border-[#D8C5A5] sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3ECE2]">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={booking.serviceTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#251117] text-[10px] font-bold text-[#E5B85C]">
                        WEDPLAN
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {status === "ACCEPTED" ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          ACCEPTED
                        </span>
                      ) : status === "CANCELLED" || status === "REJECTED" ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                          {status}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          PENDING
                        </span>
                      )}

                      <span className="text-[11px] text-[#7D6F73]">
                        Requested on {formatDateOnly(booking.createdAt)}
                      </span>
                    </div>

                    <h2 className="mt-1.5 font-serif text-lg font-bold text-[#1F1A1D] sm:text-xl">
                      {booking.serviceTitle}
                    </h2>

                    <p className="mt-0.5 text-xs text-[#6B5E62]">
                      Vendor:{" "}
                      <span className="font-semibold text-[#1F1A1D]">
                        {booking.vendorName || "Verified Studio"}
                      </span>
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#6B5E62]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#7D6F73]" />
                        <span>Event: {booking.eventDate}</span>
                      </span>

                      {booking.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#7D6F73]" />
                          <span>{booking.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex shrink-0 items-center justify-end sm:pl-4">
                  {status === "PENDING" ? (
                    <button
                      type="button"
                      disabled={cancellingId === booking._id}
                      onClick={() => handleCancelRequest(booking._id)}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                  ) : (
                    <span className="text-xs italic text-[#8E8185]">
                      Action locked ({status.toLowerCase()})
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