"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface ServiceDetail {
  _id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  rating?: number;
  summary?: string;
  image?: string;
  vendorEmail?: string;
  vendorName?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params?.id;

  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("150");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  useEffect(() => {
    if (!serviceId) return;

    let active = true;
    async function fetchServiceDetail() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
        if (res.status === 404 || res.status === 400) {
          if (active) setNotFound(true);
          return;
        }
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active) {
          setService(data.service || data);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchServiceDetail();
    return () => {
      active = false;
    };
  }, [serviceId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("Please sign in first to submit a booking request.");
      router.push("/sign-in");
      return;
    }

    if (!service) return;

    if (!eventDate) {
      toast.error("Please select your wedding or event date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceId: service._id,
          serviceTitle: service.title,
          vendorEmail: service.vendorEmail || "",
          vendorName: service.vendorName || "Verified Studio",
          customerEmail: user.email,
          customerName: user.name || "Couple",
          eventDate,
          guestCount: Number(guestCount) || 100,
          notes: notes.trim(),
          price: service.price || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not submit booking request");
        return;
      }

      setBookedSuccess(true);
      toast.success("Booking request sent to the studio!");
    } catch {
      toast.error("Something went wrong while booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 text-[#1F1A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5E1929] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Wedding Services</span>
        </Link>

        {loading ? (
          <div className="mt-16 flex items-center justify-center gap-2 text-sm text-[#6B5E62]">
            <Loader2 className="h-5 w-5 animate-spin text-[#5E1929]" />
            <span>Loading package details...</span>
          </div>
        ) : notFound || !service ? (
          <div className="mt-8 rounded-3xl border border-[#E6DCD2] bg-white p-10 text-center">
            <h1 className="font-serif text-2xl font-bold text-[#1F1A1D]">
              Service Not Found
            </h1>
            <p className="mt-2 text-sm text-[#6B5E62]">
              This wedding service may have been removed or the link is
              invalid.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex rounded-xl bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white"
            >
              Browse Available Services
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Service Details (7 cols) */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[#E6DCD2] bg-white shadow-2xs">
                {service.image && (
                  <div className="h-72 w-full overflow-hidden bg-[#F7F1E7] sm:h-96">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2E2E4] px-3.5 py-1 text-xs font-semibold text-[#5E1929]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{service.category}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F1A1D]">
                      <Star className="h-4 w-4 fill-[#C59B47] text-[#C59B47]" />
                      {(service.rating ?? 5.0).toFixed(1)}
                    </span>
                  </div>

                  <h1 className="mt-4 font-serif text-3xl font-bold text-[#1F1A1D] sm:text-4xl">
                    {service.title}
                  </h1>

                  <p className="mt-1.5 text-sm font-medium text-[#6B5E62]">
                    Curated by{" "}
                    <span className="font-semibold text-[#1F1A1D]">
                      {service.vendorName || "Verified Studio"}
                    </span>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-5 border-y border-[#EFE7DE] py-4 text-xs text-[#6B5E62]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#C59B47]" />
                      <span>{service.location}</span>
                    </span>

                    <div>
                      <span className="font-bold uppercase tracking-wider text-[#6B5E62]">
                        Starting Package:{" "}
                      </span>
                      <span className="font-serif text-lg font-bold text-[#5E1929]">
                        ${Number(service.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="font-serif text-lg font-bold text-[#1F1A1D]">
                      Package Overview
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#6B5E62]">
                      {service.summary ||
                        "Contact this studio with your event date and guest count for tailored package details and availability."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Request Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
                  RESERVE YOUR DATE
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#1F1A1D]">
                  Request a Booking
                </h2>
                <p className="mt-1.5 text-xs text-[#6B5E62]">
                  Send an inquiry directly to {service.vendorName || "the studio"}.
                  No upfront payment is charged until reviewed.
                </p>

                {bookedSuccess ? (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-700" />
                    <h3 className="mt-3 font-serif text-xl font-bold text-[#1F1A1D]">
                      Inquiry Sent!
                    </h3>
                    <p className="mt-1 text-xs text-[#6B5E62]">
                      Your booking request for{" "}
                      <span className="font-semibold">{eventDate}</span> is now
                      pending studio review.
                    </p>
                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                      <Link
                        href="/dashboard/customer/bookings"
                        className="rounded-xl bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#46111E]"
                      >
                        View My Bookings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setBookedSuccess(false);
                          setEventDate("");
                          setNotes("");
                        }}
                        className="rounded-xl border border-[#E6DCD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#1F1A1D]"
                      >
                        Send Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="eventDate"
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                      >
                        <Calendar className="h-3.5 w-3.5 text-[#5E1929]" />
                        <span>EVENT DATE *</span>
                      </label>
                      <input
                        id="eventDate"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="guestCount"
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                      >
                        <Users className="h-3.5 w-3.5 text-[#5E1929]" />
                        <span>ESTIMATED GUESTS</span>
                      </label>
                      <input
                        id="guestCount"
                        type="number"
                        min="1"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                      >
                        EVENT NOTES & PREFERENCES
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Share venue details, ceremony timing, or custom requests..."
                        className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#9E9397] focus:border-[#5E1929] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5E1929] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46111E] disabled:opacity-60"
                    >
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>
                        {submitting
                          ? "Sending Request..."
                          : "Submit Booking Request"}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}