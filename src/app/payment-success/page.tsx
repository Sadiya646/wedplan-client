"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your Stripe payment...");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("Missing Stripe checkout session ID.");
      return;
    }

    let active = true;

    async function verifySession() {
      try {
        const res = await fetch(`${API_BASE}/api/stripe/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });
        const data = await safeJson(res);

        if (!res.ok || !data.verified) {
          if (active) {
            setStatus("error");
            setMessage(
              data.message || data.error || "Payment was not completed."
            );
          }
          return;
        }

        if (active) {
          setEmail(data.email || "");
          setStatus("success");
          setMessage(
            "Payment verified! Your Vendor Premium (Unlimited Studio Growth) plan is now active."
          );
        }
      } catch (err: unknown) {
        if (active) {
          setStatus("error");
          setMessage(
            err instanceof Error ? err.message : "Failed to verify payment."
          );
        }
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-3xl border border-[#ECE2D6] bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#5E1929]" />
            <p className="text-sm font-medium text-[#3D3337]">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <h1 className="font-serif text-2xl font-bold text-[#1F1A1D]">
              Payment Successful
            </h1>
            <p className="text-sm text-[#6B5E62]">{message}</p>
            {email && (
              <p className="mt-1 rounded-xl bg-[#FAF7F2] px-4 py-2 text-xs text-[#3D3337]">
                Vendor Account: <strong>{email}</strong>
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/dashboard/vendor/subscription"
                className="rounded-xl bg-[#1C1214] px-5 py-2.5 text-xs font-bold text-[#D6B15C] transition hover:opacity-95"
              >
                Go to Subscription Page
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <h1 className="font-serif text-2xl font-bold text-[#1F1A1D]">
              Verification Issue
            </h1>
            <p className="text-sm text-red-600">{message}</p>
            <Link
              href="/dashboard/vendor/subscription"
              className="mt-4 rounded-xl bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white"
            >
              Back to Subscription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#6B5E62]">
          Loading payment confirmation...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}