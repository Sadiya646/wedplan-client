"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";

interface VendorServiceItem {
  _id: string;
  vendorEmail?: string;
  status?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FREE_PACKAGE_LIMIT = 3;

export default function VendorSubscriptionPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const vendorEmail = session?.user?.email;

  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [plan, setPlan] = useState<"FREE" | "PREMIUM">("FREE");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!vendorEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!sessionPending) setLoading(false);
      return;
    }

    let active = true;

    async function loadVendorPlanAndUsage() {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(vendorEmail!);

        // 1. Fetch public services to calculate free slot usage (up to 3 free)
        let sRes = await fetch(`${API_BASE}/api/services?vendorEmail=${encoded}`);
        if (!sRes.ok) {
          sRes = await fetch(`${API_BASE}/api/services`);
        }

        if (sRes.ok && active) {
          const sData = await sRes.json();
          const allList: VendorServiceItem[] = Array.isArray(sData)
            ? sData
            : sData.services || [];
          const mine = allList.filter(
            (item) =>
              !item.vendorEmail ||
              item.vendorEmail.toLowerCase() === vendorEmail!.toLowerCase()
          );
          setPublishedCount(mine.length);
        }

        // 2. Fetch protected vendor profile / subscription status
        const uRes = await authFetch(
          `${API_BASE}/api/users/profile?email=${encoded}`
        );
        if (uRes.ok && active) {
          const uData = await uRes.json();
          const dbPlan = (
            uData?.user?.subscriptionPlan ||
            uData?.user?.plan ||
            "FREE"
          ).toUpperCase();
          if (
            dbPlan === "PREMIUM" ||
            dbPlan === "PRO" ||
            dbPlan === "VENDOR_PREMIUM"
          ) {
            setPlan("PREMIUM");
          } else {
            setPlan("FREE");
          }
        }
      } catch {
        // Keep defaults on error
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVendorPlanAndUsage();
    return () => {
      active = false;
    };
  }, [vendorEmail, sessionPending]);

  const handleUpgrade = async () => {
    if (!vendorEmail) {
      toast.error("Please sign in to upgrade your subscription.");
      return;
    }

    setUpgrading(true);
    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscription",
          email: vendorEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error || "Failed to start Stripe checkout.");
        return;
      }

      window.location.assign(data.url);
    } catch {
      toast.error("Could not connect to Stripe checkout.");
    } finally {
      setUpgrading(false);
    }
  };

  const remainingFreePosts = Math.max(0, FREE_PACKAGE_LIMIT - publishedCount);
  const limitReached = plan === "FREE" && publishedCount >= FREE_PACKAGE_LIMIT;

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88D2F]">
          STUDIO MEMBERSHIP
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#1F1A1D] sm:text-4xl">
          Vendor Subscription Plans
        </h1>
        <p className="mt-1 text-xs text-[#6B5E62] sm:text-sm">
          Start free with up to 3 wedding packages or unlock unlimited listings
          and priority placement.
        </p>
      </div>

      {/* Live Free Post Usage Banner */}
      {!loading && !sessionPending && (
        <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-[#ECE2D6] bg-white px-5 py-4 sm:flex-row sm:items-center">
          <div className="text-xs text-[#3D3337]">
            <span className="font-semibold text-[#5E1929]">
              Free Listing Usage:{" "}
            </span>
            <span>
              {plan === "PREMIUM"
                ? `Unlimited active (${publishedCount} published)`
                : `${Math.min(publishedCount, FREE_PACKAGE_LIMIT)} / ${FREE_PACKAGE_LIMIT} free posts used (${remainingFreePosts} free post${remainingFreePosts === 1 ? "" : "s"} remaining)`}
            </span>
          </div>

          {limitReached && (
            <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800">
              Free 3-post limit reached — upgrade to post more
            </span>
          )}
        </div>
      )}

      {/* Two Plan Cards */}
      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Free Plan Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#ECE2D6] bg-white p-7 shadow-[0_2px_12px_rgba(31,26,29,0.02)] sm:p-8">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold text-[#1F1A1D]">
                Free Plan
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  plan === "FREE"
                    ? "bg-[#F5E6E8] text-[#5E1929]"
                    : "bg-[#F3ECE2] text-[#6B5E62]"
                }`}
              >
                {plan === "FREE" ? "CURRENT PLAN" : "FREE TIER"}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-serif text-4xl font-bold text-[#1F1A1D]">
                $0
              </span>
              <span className="text-xs text-[#6B5E62]">/forever</span>
            </div>

            <p className="mt-2.5 border-b border-[#F1E9DF] pb-5 text-xs text-[#6B5E62]">
              Ideal for studios getting started on WedPlan.
            </p>

            <ul className="mt-6 space-y-3.5 text-xs text-[#251319] sm:text-sm">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-[#5E1929]" />
                <span>Up to 3 active wedding service packages</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-[#5E1929]" />
                <span>Receive & manage couple booking requests</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-[#5E1929]" />
                <span>Standard studio profile listing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-xl border border-[#ECE2D6] bg-[#FAF7F2] py-3.5 text-xs font-semibold text-[#8E8185]"
          >
            {plan === "FREE" ? "Active Plan" : "Included in Account"}
          </button>
        </div>

        {/* Right: Dark Premium Plan Card */}
        <div className="flex flex-col justify-between rounded-3xl bg-[#1C1214] p-7 text-[#FAF7F2] shadow-lg sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D6B15C]">
              <Crown className="h-3.5 w-3.5" />
              <span>VENDOR PREMIUM</span>
            </div>

            <h2 className="mt-2.5 font-serif text-2xl font-bold text-white sm:text-3xl">
              Unlimited Studio Growth
            </h2>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-serif text-4xl font-bold text-[#D6B15C]">
                $29
              </span>
              <span className="text-xs text-[#B8AEB1]">/month</span>
            </div>

            <p className="mt-2.5 border-b border-white/10 pb-5 text-xs leading-relaxed text-[#B8AEB1]">
              For established wedding venues, studios, and planners scaling
              bookings.
            </p>

            <ul className="mt-6 space-y-3.5 text-xs text-[#E8E0E2] sm:text-sm">
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 shrink-0 text-[#D6B15C]" />
                <span>Publish unlimited wedding service packages</span>
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 shrink-0 text-[#D6B15C]" />
                <span>Verified Premium Studio badge</span>
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 shrink-0 text-[#D6B15C]" />
                <span>Boosted visibility in search & featured listings</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={upgrading || plan === "PREMIUM"}
            onClick={handleUpgrade}
            className="mt-8 w-full rounded-xl bg-[#C99B3B] py-3.5 text-xs font-bold text-[#1A0D11] shadow-sm transition hover:bg-[#D6A949] disabled:opacity-60"
          >
            {plan === "PREMIUM"
              ? "Premium Active"
              : upgrading
              ? "Redirecting to Stripe..."
              : "Upgrade to Vendor Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}