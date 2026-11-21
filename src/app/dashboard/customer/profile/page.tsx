"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, UserCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CustomerProfilePage() {
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const sessionRes = await authClient.getSession();
        const sessionUser = sessionRes.data?.user as
          | { email?: string; name?: string }
          | undefined;

        const email = sessionUser?.email || "";
        if (!email) {
          if (active) setLoading(false);
          return;
        }

        if (active) {
          setUserEmail(email);
          setName(sessionUser?.name || "");
        }

        const res = await fetch(
          `${API_BASE}/api/users/profile?email=${encodeURIComponent(email)}`,
          { credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          const dbUser = data?.user;
          if (active && dbUser) {
            setName(dbUser.name || sessionUser?.name || "");
            setPhone(dbUser.phone || "");
            setEventLocation(dbUser.eventLocation || "");
            setEventDate(dbUser.eventDate || "");
          }
        }
      } catch {
        // Keep defaults on error
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Please sign in to update your profile.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: userEmail,
          name: name.trim(),
          phone: phone.trim(),
          eventLocation: eventLocation.trim(),
          eventDate: eventDate.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.message || "Failed to save profile");
        return;
      }

      toast.success("Customer profile saved!");
    } catch {
      toast.error("Something went wrong while saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
          COUPLE PREFERENCES
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#1F1A1D]">
          Profile & Celebration Details
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Keep your contact info and wedding date handy for faster studio
          bookings.
        </p>
      </div>

      <div className="mt-7 max-w-2xl rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6B5E62]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#5E1929]" />
            <span>Loading profile...</span>
          </div>
        ) : !userEmail ? (
          <div className="py-8 text-center">
            <UserCheck className="mx-auto h-8 w-8 text-[#C59B47]" />
            <p className="mt-2 font-serif text-lg font-bold text-[#1F1A1D]">
              Sign in required
            </p>
            <p className="mt-1 text-xs text-[#6B5E62]">
              Please sign in with your customer account to manage your profile.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-[#E6DCD2] bg-[#F5EFE6] px-4 py-3 text-sm text-[#6B5E62]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                >
                  FULL NAME
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="customerPhone"
                  className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                >
                  PHONE NUMBER
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="eventLocation"
                  className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                >
                  PREFERRED EVENT CITY / VENUE AREA
                </label>
                <input
                  id="eventLocation"
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g., Gulshan, Dhaka"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
                >
                  TENTATIVE EVENT DATE
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5E1929] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#46111E] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}