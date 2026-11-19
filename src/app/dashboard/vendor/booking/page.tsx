"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, Check, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface VendorBookingItem {
  _id: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  eventDate: string;
  guestCount?: number;
  price?: number;
  notes?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VendorBookingsPage() {
  const { data: session } = useSession();
  const vendorEmail = session?.user?.email;

  const [bookings, setBookings] = useState<VendorBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchVendorBookings() {
      try {
        const res = await fetch(
          `${API_BASE}/api/bookings/vendor?email=${encodeURIComponent(
            vendorEmail!
          )}`,
          { credentials: "include" }
        );
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

    fetchVendorBookings();
    return () => {
      active = false;
    };
  }, [vendorEmail]);

  const handleStatusUpdate = async (
    bookingId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update booking status");
        return;
      }

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? { ...item, status } : item))
      );
      toast.success(`Booking marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Something went wrong while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
          Booking Requests
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Review event dates from couples and accept or decline inquiries.
        </p>
      </div>

      <div className="mt-7 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            Loading booking requests...
          </p>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-xl font-bold text-[#1F1A1D]">
              No booking requests received yet
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[#6B5E62]">
              When customers submit a booking on your listed services, it will
              show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col justify-between gap-4 py-5 lg:flex-row lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-serif text-lg font-bold text-[#1F1A1D]">
                      {booking.serviceTitle}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : booking.status === "REJECTED" ||
                            booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-[#6B5E62]">
                    Client: {booking.customerName} ({booking.customerEmail})
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#6B5E62]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#C59B47]" />
                      <span>{booking.eventDate}</span>
                    </span>
                    {booking.guestCount && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#C59B47]" />
                        <span>{booking.guestCount} Guests</span>
                      </span>
                    )}
                    {typeof booking.price === "number" && booking.price > 0 && (
                      <span className="font-semibold text-[#5E1929]">
                        ${booking.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="mt-2 text-xs italic text-[#6B5E62]">
                      “{booking.notes}”
                    </p>
                  )}
                </div>

                {booking.status === "PENDING" && (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={updatingId === booking._id}
                      onClick={() =>
                        handleStatusUpdate(booking._id, "ACCEPTED")
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Accept</span>
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === booking._id}
                      onClick={() =>
                        handleStatusUpdate(booking._id, "REJECTED")
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}