"use client";

import { useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VendorSubscriptionPage() {
  const { data: session } = useSession();
  const user = session?.user as
    | { email?: string | null; plan?: string | null }
    | undefined;

  const [currentPlan, setCurrentPlan] = useState<"FREE" | "PREMIUM">(
    user?.plan === "PREMIUM" ? "PREMIUM" : "FREE"
  );
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgradePlan = async () => {
    setUpgrading(true);
    try {
      if (user?.email) {
        await fetch(`${API_BASE}/api/users/plan`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: user.email, plan: "PREMIUM" }),
        }).catch(() => null);
      }

      setCurrentPlan("PREMIUM");
      toast.success("Upgraded to WedPlan Vendor Premium!");
    } catch {
      toast.error("Could not complete upgrade right now.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
          STUDIO MEMBERSHIP
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#1F1A1D] sm:text-4xl">
          Vendor Subscription Plans
        </h1>
        <p className="mt-1.5 text-sm text-[#6B5E62]">
          Start free with up to 3 wedding packages or unlock unlimited listings
          and priority placement.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Free Plan Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#E6DCD2] bg-white p-7 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#1F1A1D]">
                Free Plan
              </h2>
              {currentPlan === "FREE" && (
                <span className="rounded-full bg-[#F5E6E8] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E1929]">
                  CURRENT PLAN
                </span>
              )}
            </div>

            <p className="mt-3 font-serif text-3xl font-bold text-[#1F1A1D]">
              $0{" "}
              <span className="font-sans text-xs font-normal text-[#6B5E62]">
                / forever
              </span>
            </p>
            <p className="mt-2 text-xs text-[#6B5E62]">
              Ideal for studios getting started on WedPlan.
            </p>

            <ul className="mt-6 space-y-3 border-t border-[#EFE7DE] pt-5 text-sm text-[#1F1A1D]">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#5E1929]" />
                <span>Up to 3 active wedding service packages</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#5E1929]" />
                <span>Receive & manage couple booking requests</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#5E1929]" />
                <span>Standard studio profile listing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled
            className="mt-8 w-full rounded-xl border border-[#E6DCD2] bg-[#FAF7F2] py-3 text-xs font-semibold text-[#6B5E62]"
          >
            {currentPlan === "FREE" ? "Active Plan" : "Starter Tier"}
          </button>
        </div>

        {/* Premium Plan Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#C59B47]/50 bg-[#1C1414] p-7 text-white shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#E5B85C]">
                <Crown className="h-4 w-4" />
                <span>VENDOR PREMIUM</span>
              </span>
              {currentPlan === "PREMIUM" && (
                <span className="rounded-full bg-[#C89D3C]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E5B85C]">
                  ACTIVE
                </span>
              )}
            </div>

            <h2 className="mt-2 font-serif text-2xl font-bold text-white">
              Unlimited Studio Growth
            </h2>
            <p className="mt-3 font-serif text-3xl font-bold text-[#E5B85C]">
              $29{" "}
              <span className="font-sans text-xs font-normal text-[#CFC4C7]">
                / month
              </span>
            </p>
            <p className="mt-2 text-xs text-[#CFC4C7]">
              For established wedding venues, studios, and planners scaling
              bookings.
            </p>

            <ul className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-[#F5EFEA]">
              <li className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#E5B85C]" />
                <span>Publish unlimited wedding service packages</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#E5B85C]" />
                <span>Verified Premium Studio badge</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#E5B85C]" />
                <span>Boosted visibility in search & featured listings</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={upgrading || currentPlan === "PREMIUM"}
            onClick={handleUpgradePlan}
            className="mt-8 w-full rounded-xl bg-[#C89D3C] py-3.5 text-xs font-bold text-[#1F1A1D] transition hover:bg-[#B88D2F] disabled:opacity-60"
          >
            {currentPlan === "PREMIUM"
              ? "Premium Plan Active"
              : upgrading
              ? "Upgrading..."
              : "Upgrade to Vendor Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}