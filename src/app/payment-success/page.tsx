import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "subscription"],
    });
  } catch {
    redirect("/");
  }

  if (session.status !== "complete") {
    redirect("/");
  }

  const meta = session.metadata || {};
  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

  // 1. If Vendor Subscription upgrade
  if (meta.type === "subscription" && meta.userEmail) {
    await fetch(`${API_BASE}/api/users/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: meta.userEmail,
        subscriptionPlan: "PREMIUM",
        stripeTransactionId: transactionId,
      }),
    }).catch(() => {});
  }

  // 2. If Customer Booking payment
  if (meta.type === "booking" && meta.bookingId) {
    await fetch(`${API_BASE}/api/bookings/${meta.bookingId}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: "PAID",
        transactionId,
        amountPaid,
      }),
    }).catch(() => {});
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-16 text-[#1F1A1D]">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#ECE2D6] bg-white p-8 text-center shadow-sm">
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
          PAYMENT CONFIRMED
        </span>

        <h1 className="mt-4 font-serif text-3xl font-bold text-[#1F1A1D]">
          Payment Successful!
        </h1>

        <p className="mt-2 text-xs text-[#6B5E62]">
          {meta.type === "subscription"
            ? "Your Vendor Premium subscription is now active. You can publish unlimited wedding packages."
            : `Your payment for "${meta.serviceTitle || "Wedding Package"}" has been recorded.`}
        </p>

        <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-4 text-left text-xs text-[#3D3337]">
          <p>
            <span className="font-semibold">Amount Paid:</span> ${amountPaid.toFixed(2)}
          </p>
          <p className="mt-1 break-all">
            <span className="font-semibold">Transaction ID:</span> {transactionId}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {meta.type === "subscription" ? (
            <Link
              href="/dashboard/vendor/subscription"
              className="rounded-xl bg-[#5E1929] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#46111E]"
            >
              Back to Subscription Plan
            </Link>
          ) : (
            <Link
              href="/dashboard/customer/bookings"
              className="rounded-xl bg-[#5E1929] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#46111E]"
            >
              View My Bookings
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}